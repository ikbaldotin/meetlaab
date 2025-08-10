import { db } from "../lib/db.js";

export const getAllSubmission = async (req, res) => {
    const userId = req.userId;
    try {
        const submission = await db.submission.findMany({
            where: {
                userId: userId
            }
        })
        res.status(200).json({
            success: true,
            message: "Submissions retrieved successfully",
            submission
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}
export const getSubmissionForProblemId = async (req, res) => {
    try {
        const userId = req.user.id
        const problemId = req.params.problemId
        const submission = await db.submission.findMany({
            where: {
                userId: userId,
                problemId: problemId
            }
        })
        res.status(200).json({
            success: true,
            message: "Submissions retrieved successfully",
            submission
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}
export const getAllTheSubmissionForProblem = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const submission = await db.submission.count({
            where: {
                problemId: problemId
            }
        })
        res.status(200).json({
            success: true,
            message: "Submissions count retrieved successfully",
            submission
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "failed or fetch submission"
        })
    }
}