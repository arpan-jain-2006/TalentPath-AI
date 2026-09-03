const { GoogleGenAI, Type } = require("@google/genai")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

// Native Gemini API Schema definition
const interviewReportSchema = {
    type: Type.OBJECT,
    properties: {
        title: { 
            type: Type.STRING, 
            description: "The title of the job for which the interview report is generated" 
        },
        matchScore: { 
            type: Type.NUMBER, 
            description: "A score between 0 and 100 indicating profile match" 
        },
        technicalQuestions: {
            type: Type.ARRAY,
            description: "Technical questions along with intention and answer",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    intention: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: Type.ARRAY,
            description: "Behavioral questions along with intention and answer",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    intention: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: Type.ARRAY,
            description: "List of skill gaps with severity",
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING },
                    severity: { 
                        type: Type.STRING, 
                        description: "low, medium, or high" 
                    }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: Type.ARRAY,
            description: "Day-wise preparation plan",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER },
                    focus: { type: Type.STRING },
                    tasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
}

const resumePdfSchema = {
    type: Type.OBJECT,
    properties: {
        html: { 
            type: Type.STRING, 
            description: "The complete HTML string of the styled resume" 
        }
    },
    required: ["html"]
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription}`

    const config = {
        responseMimeType: "application/json",
        responseSchema: interviewReportSchema,
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config,
        })
        return JSON.parse(response.text.trim())
    } catch (error) {
        console.warn("Primary model 503/error, falling back to gemini-1.5-flash:", error?.message)
        const fallbackResponse = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config,
        })
        return JSON.parse(fallbackResponse.text.trim())
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-zygote",
            "--single-process"
        ]
    })

    try {
        const page = await browser.newPage()
        await page.setContent(htmlContent, { waitUntil: "networkidle0" })

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "15mm",
                bottom: "15mm",
                left: "15mm",
                right: "15mm"
            }
        })
        return pdfBuffer
    } finally {
        await browser.close()
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an ATS-friendly, clean single-page HTML resume for this profile:
Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription}`

    const config = {
        responseMimeType: "application/json",
        responseSchema: resumePdfSchema,
    }

    let jsonContent
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config,
        })
        jsonContent = JSON.parse(response.text.trim())
    } catch (error) {
        console.warn("Primary model 503/error for PDF, falling back to gemini-1.5-flash:", error?.message)
        const fallbackResponse = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config,
        })
        jsonContent = JSON.parse(fallbackResponse.text.trim())
    }

    return await generatePdfFromHtml(jsonContent.html)
}

module.exports = { generateInterviewReport, generateResumePdf }