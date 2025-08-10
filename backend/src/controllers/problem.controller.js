import { db } from "../lib/db.js"
import { getJudge0LanguageId, submitBatch, pollBatchResults } from "../lib/judge0.lib.js"
export const createProblem = async (req, res) => {
    const { title, description, tag, examples, constraints, testcases, difficulty, codeSnippets, referenceSolutions } = req.body
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "You are not authorized to create a problem" })
    }
    try {
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language)
            if (!languageId) {
                return res.status(400).json({ error: `Unsupported language: ${language}` })
            }
            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }))
            const submissionsResult = await submitBatch(submissions)
            const token = submissionsResult.map((res) => res.token)
            const results = await pollBatchResults(token)
            for (let i = 0; i < results.length; i++) {
                const result = results[i]
                console.log("Result---", result)
                if (result.status.id !== 3) {
                    return res.status(400).json({ error: `Test case ${i + 1} failed for language ${language}` });
                }
            }

            const newProblem = await db.problem.create({
                data: {
                    title,
                    description,
                    difficulty,
                    tag,
                    examples,
                    constraints,
                    testcases,
                    codeSnippets,
                    referenceSolutions,
                    userId: req.user.id,
                }
            })
            return res.status(201).json(newProblem)
        }

    } catch (error) {
        console.error("Error creating problem:", error);
        res.status(500).json({ error: "Error creating problem", error });

    }
}
export const getAllProblems = async (req, res) => {
    try {
        const problem = await db.problem.findMany()
        if (!problem) {
            return res.status(404).json({ error: "No problems found" });
        }
        res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            problems: problem
        });
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ error: "Error fetching problems", error });
    }
}

export const getProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        const problem = await db.problem.findUnique({
            where: { id }
        })
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }
        res.status(200).json({
            success: true,
            message: "Problem fetched successfully",
            problem
        });
    } catch (error) {
        console.error("Error fetching problem:", error);
        res.status(500).json({ error: "Error fetching problem", error });
    }
}

export const updatedProblem = async (req, res) => {
    const { title, description, tag, examples, constraints, testcases, difficulty, codeSnippets, referenceSolutions } = req.body
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "You are not authorized to create a problem" })
    }
    const { id } = req.params;
    try {
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language)
            if (!languageId) {
                return res.status(400).json({ error: `Unsupported language: ${language}` })
            }
            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }))
            const submissionsResult = await submitBatch(submissions)
            const token = submissionsResult.map((res) => res.token)
            const results = await pollBatchResults(token)
            for (let i = 0; i < results.length; i++) {
                const result = results[i]
                console.log("Result---", result)
                if (result.status.id !== 3) {
                    return res.status(400).json({ error: `Test case ${i + 1} failed for language ${language}` });
                }
            }
        } // <-- Add this closing brace for the 'for' loop
        const updatedProblem = await db.problem.update({
            where: { id },
            data: {
                title,
                description,
                tag,
                examples,
                constraints,
                testcases,
                difficulty,
                codeSnippets,
                referenceSolutions
            }
        })
        if (!updatedProblem) {
            return res.status(404).json({ error: "Problem not found" });
        }
        res.status(200).json({
            success: true,
            message: "Problem updated successfully",
            problem: updatedProblem
        });
    } catch (error) {
        console.error("Error updating problem:", error);
        res.status(500).json({ error: "Error updating problem", error });

    }
}

export const deleteProblem = async (req, res) => {
    const { id } = req.params
    try {
        const problem = await db.problem.findUnique({ where: { id } })
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }
        await db.problem.delete({ where: { id } });
        res.status(200).json({
            success: true,
            message: "Problem deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting problem:", error);
        res.status(500).json({ error: "Error deleting problem", error });
    }
}

export const getAllProblemsSolvedByUser = async (req, res) => {
    try {
        const problems = await db.problem.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                solvedBy: {
                    where: {
                        userId: req.user.id
                    }
                }
            }
        })
        res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            problems
        })
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ error: "Error fetching problems", error });
    }
}