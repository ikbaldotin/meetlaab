import { db } from "../lib/db.js"
import { getLanguageName, pollBatchResults, submitBatch } from "../lib/judge0.lib.js"

export const executedCode = async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problemId } = req.body
        const userId = req.user.id

        if (
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid input format. Ensure stdin and expected_outputs are arrays of the same length."
            })
        }
        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input,

        }))
        const submitResponse = await submitBatch(submissions)
        const tokens = submitResponse.map((res) => res.token)
        const result = await pollBatchResults(tokens)

        let allPassesd = true;
        const detailsResult = result.map((result, i) => {
            const stdout = result.stdout?.trim()
            const expected_output = expected_outputs[i]?.trim()
            const passed = stdout === expected_output;
            if (!passed) allPassesd = false
            return {
                testcase: i + 1,
                passed,
                stdout,
                executed: expected_output,
                compile_output: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory}KB` : undefined,
                time: result.time ? `${result.time} s` : undefined,
            }
        })

        const submission = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: getLanguageName(language_id),
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailsResult.map((r) => r.stdout)),
                stderr: detailsResult.some((r) => r.stderr) ? JSON.stringify(detailsResult.map((r) => r.stderr)) : null,
                compiledOutput: detailsResult.some((r) => r.compile_output) ? JSON.stringify(detailsResult.map((r) => r.compile_output)) : null,
                status: allPassesd ? "Accepted" : "Wrong Answer",
                memory: detailsResult.some((r) => r.memory) ? JSON.stringify(detailsResult.map((r) => r.memory)) : null,
                time: detailsResult.some((r) => r.time) ? JSON.stringify(detailsResult.map((r) => r.time)) : null,
            }
        })
        if (allPassesd) {
            await db.problemSolved.upsert({
                where: {
                    userId_problemId: {

                        userId, problemId

                    }
                }, update: {},
                create: {
                    userId, problemId
                }
            })
        }
        const testCaseResults = detailsResult.map((result) => ({
            submissionId: submission.id,
            testcase: result.testcase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compiledOutput: result.compile_output,
            status: result.status,
            memory: result.memory,
            time: result.time,
        }))
        await db.TestCaseResult.createMany({
            data: testCaseResults
        })
        const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id: submission.id
            }, include: { testcases: true }
        })
        res.status(200).json({
            success: true,
            message: "Code executed successfully",
            submission: submissionWithTestCase
        })
    } catch (error) {
        console.error("Error executing code:-----", error)
        res.status(500).json({
            success: false,
            message: "Error executing code",
            error: error.message
        })
    }
}

