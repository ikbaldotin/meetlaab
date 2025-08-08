
import axios from "axios"
export const getJudge0LanguageId = (language) => {
    const languageMap = {
        "PYTHON": 71,
        "JAVA": 62,
        "JAVASCRIPT": 63,
    }

    return languageMap[language.toUpperCase()]
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const pollBatchResults = async (tokens) => {
    const maxAttempts = 30; // Prevent infinite loops
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            const { data } = await axios.get(
                `${process.env.JUDGE_API_URL}/submissions/batch`,
                {
                    params: {
                        tokens: tokens.join(","),
                        base64_encoded: false,
                    },
                    headers: {
                        Authorization: `Bearer ${process.env.JUDGE_API_KEY}`,
                    },
                }
            );

            const results = data.submissions;

            // Check if all submissions are done processing
            // Status IDs: 1 = In Queue, 2 = Processing
            const isAllDone = results.every(
                (result) => result.status.id !== 1 && result.status.id !== 2
            );

            if (isAllDone) {
                return results;
            }

            await sleep(1000);
            attempts++;
        } catch (error) {
            console.error(
                "Error polling results:",
                error.response?.data || error.message
            );
            throw error;
        }
    }

    throw new Error("Polling timeout: Results took too long to process");
};



export const submitBatch = async (submissions) => {
    try {
        const options = {
            method: "POST",
            url: `${process.env.JUDGE_API_URL}/submissions/batch`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${process.env.JUDGE_API_KEY}`,
            },
            data: {
                submissions,
            },
        };

        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error("Error submitting batch:", error.response?.data || error.message);
        throw error;
    }
};

export function getLanguageName(language_id) {
    const LANGUAGE_NAMES = {
        74: "TypeScript",
        63: "JavaScript",
        71: "Python",
        62: "Java",
    }

    return LANGUAGE_NAMES[language_id] || "unknow"
}