import { 
    getAllInterviewReports, 
    generateInterviewReport, 
    getInterviewReportById, 
    generateResumePdf 
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

    const getResumePdf = async (interviewReportId) => {
        if (!interviewReportId) return
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            
            // Handle binary/blob response
            const pdfBlob = response instanceof Blob 
                ? response 
                : new Blob([response?.data || response], { type: "application/pdf" })

            const url = window.URL.createObjectURL(pdfBlob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error downloading resume PDF:", error)
        } finally {
            setLoading(false)
        }
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
        getResumePdf 
    }
}