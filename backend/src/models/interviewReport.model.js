const mongoose = require('mongoose');


const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    _id: false
})

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    _id: false
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [ true, "Skill is required" ]
    },
    severity: {
        type: String,
        enum: [ "low", "medium", "high" ],
        required: [ true, "Severity is required" ]
    }
}, {
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [ true, "Day is required" ]
    },
    focus: {
        type: String,
        required: [ true, "Focus is required" ]
    },
    tasks: [ {
        type: String,
        required: [ true, "Task is required" ]
    } ]
}, {
    _id: false
})

const mcqSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
    category: { type: String, default: "Technical" }
}, { _id: false });

const dsaExampleSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: "" }
}, { _id: false });

const dsaTestCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true }
}, { _id: false });

const dsaQuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
    timeLimitMinutes: { type: Number, default: 15 },
    problemStatement: { type: String, required: true },
    constraints: [{ type: String }],
    examples: [dsaExampleSchema],
    starterCode: {
        javascript: { type: String, default: "" },
        python: { type: String, default: "" },
        java: { type: String, default: "" },
        cpp: { type: String, default: "" },
        c: { type: String, default: "" }
    },
    testCases: [dsaTestCaseSchema]
}, { _id: false });

const assessmentSchema = new mongoose.Schema({
    mcqs: [mcqSchema],
    dsaQuestions: [dsaQuestionSchema]
}, { _id: false });

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        default: ""
    },
    jobDescriptionImage: {
        type: String, // Stored as Base64 Data URL (data:image/...;base64,...)
        default: null
    },
    resume: {
        type: String,
        default: ""
    },
    selfDescription: {
        type: String,
        default: ""
    },
    selfDescriptionImage: {
        type: String, // Stored as Base64 Data URL (data:image/...;base64,...)
        default: null
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [ technicalQuestionSchema ],
    behavioralQuestions: [ behavioralQuestionSchema ],
    skillGaps: [ skillGapSchema ],
    preparationPlan: [ preparationPlanSchema ],
    assessment: assessmentSchema,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        index: true
    },
    title: {
        type: String,
        required: [ true, "Job title is required" ]
    },
    resumeData: {
        type: mongoose.Schema.Types.Mixed
    },
    resumeHtml: {
        type: String
    }
}, {
    timestamps: true
})

// Compound index for ultra-fast user report fetching sorted by latest
interviewReportSchema.index({ user: 1, createdAt: -1 });

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = interviewReportModel;  