import { 
    getAllInterviewReports, 
    generateInterviewReport, 
    getInterviewReportById, 
    generateResumePdf,
    deleteInterviewReport,
    getResumePreview 
} from "../services/interview.api"
import { useContext } from "react"
import { InterviewContext } from "../interview.context"

export const useInterview = () => {
    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    // Helper: Safely extract report object regardless of API response wrapping
    const extractReport = (res) => {
        if (!res) return null
        return res.interviewReport || res.data?.interviewReport || res.data || res
    }

    // Helper: Safely extract reports list
    const extractReportsList = (res) => {
        if (!res) return []
        return res.interviewReports || res.data?.interviewReports || res.data || res || []
    }

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            const reportData = extractReport(response)
            setReport(reportData)
            // Prepend new report to recent reports list
            if (reportData?._id) {
                setReports(prev => [reportData, ...(prev || [])])
            }
            return reportData
        } catch (error) {
            console.error("Error generating interview report:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        if (!interviewId) return null
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            const reportData = extractReport(response)
            setReport(reportData)
            return reportData
        } catch (error) {
            console.error("Error fetching report by ID:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            const reportsList = extractReportsList(response)
            setReports(reportsList)
            return reportsList
        } catch (error) {
            console.error("Error fetching all reports:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const deleteReport = async (interviewId) => {
        if (!interviewId) return false
        try {
            await deleteInterviewReport(interviewId)
            setReports(prev => (prev || []).filter(r => r._id !== interviewId))
            if (report?._id === interviewId) {
                setReport(null)
            }
            return true
        } catch (error) {
            console.error("Error deleting report:", error)
            throw error
        }
    }

    const fetchResumePreview = async (interviewReportId) => {
        if (!interviewReportId) return null
        try {
            return await getResumePreview(interviewReportId)
        } catch (error) {
            console.error("Error loading resume preview:", error)
            throw error
        }
    }

    const getResumePdf = async (interviewReportId, reportTitle = "ATS_Resume") => {
        if (!interviewReportId) return
        setLoading(true)
        try {
            const cleanTitle = (reportTitle || "ATS_Resume").replace(/[^a-zA-Z0-9_-]/g, "_")
            const filename = `${cleanTitle}_Resume.pdf`

            const response = await generateResumePdf({ interviewReportId })
            
            // Force clean application/pdf Blob
            const rawBlob = response instanceof Blob ? response : new Blob([response?.data || response], { type: "application/pdf" })
            const pdfBlob = new Blob([rawBlob], { type: "application/pdf" })

            const blobUrl = window.URL.createObjectURL(pdfBlob)
            const link = document.createElement("a")
            link.style.display = "none"
            link.href = blobUrl
            link.download = filename
            link.setAttribute("download", filename)
            document.body.appendChild(link)
            link.click()

            // Keep blob URL active for 60 seconds so browser download manager finishes saving file with extension
            setTimeout(() => {
                if (link.parentNode) {
                    link.parentNode.removeChild(link)
                }
                window.URL.revokeObjectURL(blobUrl)
            }, 60000)

            return true
        } catch (error) {
            console.error("Error downloading resume PDF, falling back to direct server link:", error)
            const token = localStorage.getItem("token")
            const baseUrl = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:3000" : "https://talentpath-ai.onrender.com")
            const directUrl = `${baseUrl}/api/interview/resume/pdf/${interviewReportId}?token=${encodeURIComponent(token || "")}`
            window.location.href = directUrl
            return true
        } finally {
            setLoading(false)
        }
    }

    const openResumePdfInNewTab = (interviewReportId) => {
        if (!interviewReportId) return
        const token = localStorage.getItem("token")
        const baseUrl = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:3000" : "https://talentpath-ai.onrender.com")
        const viewUrl = `${baseUrl}/api/interview/resume/pdf/${interviewReportId}?view=inline&token=${encodeURIComponent(token || "")}`
        window.open(viewUrl, "_blank")
    }

    return { 
        loading, 
        report, 
        reports, 
        setReport,
        setReports,
        generateReport, 
        getReportById, 
        getReports, 
        deleteReport,
        fetchResumePreview,
        getResumePdf,
        openResumePdfInNewTab
    }
}