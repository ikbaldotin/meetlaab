import { pollBatchResults, submitBatch } from "../lib/judge0.lib.js"

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
        console.log("result---")
        console.log(result)
        res.status(200).json({
            success: true,
            message: "Code executed successfully",
            data: result
        })
    } catch (error) {
        console.error("Error executing code:", error)
        res.status(500).json({
            success: false,
            message: "Error executing code",
            error: error.message
        })
    }
}