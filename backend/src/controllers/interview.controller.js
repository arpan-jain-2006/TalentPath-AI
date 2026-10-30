const pdfParse = require("pdf-parse");
const { 
    generateInterviewReport, 
    generateResumePdf, 
    generateResumeStructuredData 
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        let resumeText = "";

        // Extract files from req.files (upload.fields) or req.file
        const resumeFile = req.files?.["resume"]?.[0] || (req.file?.fieldname === "resume" ? req.file : null);
        const jdImageFile = req.files?.["jdImage"]?.[0] || req.files?.["jobDescriptionImage"]?.[0] || (req.file?.fieldname === "jdImage" ? req.file : null);
        const selfImageFile = req.files?.["selfImage"]?.[0] || req.files?.["selfDescriptionImage"]?.[0] || (req.file?.fieldname === "selfImage" ? req.file : null);

        // 1. Agar resume PDF file aayi hai toh parse karein
        if (resumeFile) {
            try {
                const parsedPdf = await pdfParse(resumeFile.buffer);
                resumeText = parsedPdf.text || "";
            } catch (pdfErr) {
                console.warn("⚠️ PDF parsing warning:", pdfErr.message);
            }
        }

        const { selfDescription, jobDescription, title } = req.body;

        // Base64 Data URL formatting for proper DB storage
        let jobDescriptionImage = null;
        if (jdImageFile) {
            jobDescriptionImage = `data:${jdImageFile.mimetype};base64,${jdImageFile.buffer.toString("base64")}`;
        } else if (req.body.jobDescriptionImage && typeof req.body.jobDescriptionImage === "string" && req.body.jobDescriptionImage.startsWith("data:image")) {
            jobDescriptionImage = req.body.jobDescriptionImage;
        }

        let selfDescriptionImage = null;
        if (selfImageFile) {
            selfDescriptionImage = `data:${selfImageFile.mimetype};base64,${selfImageFile.buffer.toString("base64")}`;
        } else if (req.body.selfDescriptionImage && typeof req.body.selfDescriptionImage === "string" && req.body.selfDescriptionImage.startsWith("data:image")) {
            selfDescriptionImage = req.body.selfDescriptionImage;
        }

        // Validation: Candidate must provide Resume (PDF), Self Description, or Profile Screenshot
        const hasSelf = Boolean((resumeText && resumeText.trim()) || (selfDescription && selfDescription.trim()) || selfDescriptionImage);
        if (!hasSelf) {
            return res.status(400).json({
                message: "Please provide your background via a Resume (PDF), a Profile Screenshot, or a Quick Summary."
            });
        }

        // Validation: Target Job Description (text or screenshot image) is required
        const hasJd = Boolean((jobDescription && jobDescription.trim()) || jobDescriptionImage);
        if (!hasJd) {
            return res.status(400).json({
                message: "Target Job Description is required (paste text or upload a JD screenshot)."
            });
        }

        // 2. AI Report generate karein (passing text + image buffers for multimodal analysis)
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription || "",
            jdImage: jdImageFile ? { buffer: jdImageFile.buffer, mimeType: jdImageFile.mimetype } : null,
            selfImage: selfImageFile ? { buffer: selfImageFile.buffer, mimeType: selfImageFile.mimetype } : null
        });

        const effectiveTitle = title || interViewReportByAi.title || "Interview Strategy Plan";
        const effectiveJd = (jobDescription && jobDescription.trim()) || (jobDescriptionImage ? `[Job Description provided via uploaded screenshot for ${effectiveTitle}]` : "Job Description");
        const effectiveSelf = (selfDescription && selfDescription.trim()) || (selfDescriptionImage ? "[Profile provided via uploaded screenshot]" : "");

        // 3. Database me save karein (persisting screenshots + text + structured AI report)
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            title: effectiveTitle,
            resume: resumeText,
            selfDescription: effectiveSelf,
            jobDescription: effectiveJd,
            jobDescriptionImage,
            selfDescriptionImage,
            ...interViewReportByAi
        });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Error in generateInterViewReportController:", error);
        return res.status(500).json({
            message: "Error generating interview report",
            error: error.message || error
        });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({ 
            _id: interviewId, 
            user: req.user.id 
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Error in getInterviewReportByIdController:", error);
        return res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
}

function parseDataUriToImagePart(dataUri) {
    if (!dataUri || typeof dataUri !== "string" || !dataUri.startsWith("data:")) return null;
    const parts = dataUri.split(",");
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
    return {
        buffer: Buffer.from(parts[1], "base64"),
        mimeType
    };
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -jobDescriptionImage -selfDescriptionImage -resumeHtml -resumeData -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        console.error("Error in getAllInterviewReportsController:", error);
        return res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
}

/**
 * @description Controller to get structured ATS resume data & preview HTML.
 */
async function getResumePreviewController(req, res) {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        // Return from database cache if already generated for instant response
        if (interviewReport.resumeData && interviewReport.resumeHtml) {
            return res.status(200).json({
                message: "Resume preview fetched successfully.",
                resumeData: interviewReport.resumeData,
                html: interviewReport.resumeHtml,
                fromCache: true
            });
        }

        const { resume, jobDescription, selfDescription, title, jobDescriptionImage, selfDescriptionImage } = interviewReport;
        const jdImage = parseDataUriToImagePart(jobDescriptionImage);
        const selfImage = parseDataUriToImagePart(selfDescriptionImage);

        const { resumeData, html } = await generateResumeStructuredData({
            resume,
            jobDescription,
            selfDescription,
            title,
            jdImage,
            selfImage
        });

        // Persist to database so subsequent loads and downloads are instantaneous
        interviewReport.resumeData = resumeData;
        interviewReport.resumeHtml = html;
        await interviewReport.save();

        return res.status(200).json({
            message: "Resume preview generated successfully.",
            resumeData,
            html,
            fromCache: false
        });
    } catch (error) {
        console.error("Error in getResumePreviewController:", error);
        return res.status(500).json({
            message: "Error generating resume preview",
            error: error.message
        });
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription, title, resumeHtml, jobDescriptionImage, selfDescriptionImage } = interviewReport;

        // Use cached HTML directly if available for lightning-fast PDF generation (< 500ms)
        let pdfBuffer;
        if (resumeHtml) {
            pdfBuffer = await generateResumePdf({ cachedHtml: resumeHtml });
        } else {
            const jdImage = parseDataUriToImagePart(jobDescriptionImage);
            const selfImage = parseDataUriToImagePart(selfDescriptionImage);

            const { resumeData, html } = await generateResumeStructuredData({
                resume,
                jobDescription,
                selfDescription,
                title,
                jdImage,
                selfImage
            });
            interviewReport.resumeData = resumeData;
            interviewReport.resumeHtml = html;
            await interviewReport.save();
            pdfBuffer = await generateResumePdf({ cachedHtml: html });
        }

        const safeFilename = (title || "ATS_Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
        const isInline = req.query?.view === "inline";
        const disposition = isInline ? "inline" : "attachment";

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `${disposition}; filename="${safeFilename}_Resume.pdf"`,
            "Content-Length": pdfBuffer.length
        });

        return res.send(pdfBuffer);
    } catch (error) {
        console.error("Error in generateResumePdfController:", error);
        return res.status(500).json({ 
            message: "Error generating resume PDF", 
            error: error.message 
        });
    }
}

/**
 * @description Controller to delete an interview report by interviewId.
 */
async function deleteInterviewReportController(req, res) {
    try {
        const { interviewId } = req.params;

        const deletedReport = await interviewReportModel.findOneAndDelete({
            _id: interviewId,
            user: req.user.id
        });

        if (!deletedReport) {
            return res.status(404).json({
                message: "Interview report not found or already deleted."
            });
        }

        return res.status(200).json({
            message: "Interview report deleted successfully.",
            interviewId
        });
    } catch (error) {
        console.error("Error in deleteInterviewReportController:", error);
        return res.status(500).json({
            message: "Server error deleting interview report",
            error: error.message
        });
    }
}

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    getResumePreviewController,
    generateResumePdfController,
    deleteInterviewReportController
};