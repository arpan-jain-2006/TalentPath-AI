const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        let resumeText = "";

        // 1. Resume PDF parsing with safe fallback
        if (req.file && req.file.buffer) {
            try {
                const parsedPdf = await pdfParse(req.file.buffer);
                resumeText = parsedPdf.text || "";
            } catch (pdfErr) {
                console.error("PDF Parsing Error:", pdfErr);
            }
        }

        const { selfDescription, jobDescription, title } = req.body;

        // Validation
        if (!resumeText.trim() && (!selfDescription || !selfDescription.trim())) {
            return res.status(400).json({
                message: "Either a valid Resume or a Self Description is required."
            });
        }

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Target Job Description is required."
            });
        }

        // 2. User ID resolution (handles both id and _id)
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User identification missing."
            });
        }

        // 3. AI Report Generation
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription.trim()
        });

        if (!interViewReportByAi) {
            return res.status(500).json({
                message: "Failed to generate report from AI model."
            });
        }

        // 4. Database Insertion
        const interviewReport = await interviewReportModel.create({
            user: userId,
            title: title || interViewReportByAi.title || "Interview Plan",
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription.trim(),
            matchScore: interViewReportByAi.matchScore,
            technicalQuestions: interViewReportByAi.technicalQuestions,
            behavioralQuestions: interViewReportByAi.behavioralQuestions,
            skillGaps: interViewReportByAi.skillGaps,
            preparationPlan: interViewReportByAi.preparationPlan
        });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Critical Error in generateInterViewReportController:", error);
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
        const userId = req.user?.id || req.user?._id;

        const interviewReport = await interviewReportModel.findOne({ 
            _id: interviewId, 
            user: userId 
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

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const userId = req.user?.id || req.user?._id;

        const interviewReports = await interviewReportModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

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

        const { resume, jobDescription, selfDescription } = interviewReport;

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
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

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    generateResumePdfController 
};