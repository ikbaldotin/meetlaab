; import express from "express"
import { authMiddleware } from "../middleware/auth.middleware";
import { getAllSubmission, getAllTheSubmissionForProblem, getSubmissionForProblemId } from "../controllers/submission.controller.js";

const submissionRoute = express.Router()

submissionRoute.get("/get-all-submissions", authMiddleware, getAllSubmission)
submissionRoute.get("/get-all-submissions/:problemId", authMiddleware, getSubmissionForProblemId)
submissionRoute.get("/get-submission-count/:problemId", authMiddleware, getAllTheSubmissionForProblem)

export default submissionRoute;