
const axios = require('axios');

module.exports = async function (context, req) {
    const question = req.body?.question;
    const answer = req.body?.answer;

    if (!question || !answer) {
        context.res = {
            status: 400,
            body: {
                error: "Missing question or answer."
            }
        };
        return;
    }

    try {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;

        const response = await axios.post(
            `${endpoint}/chat/completions`,
            {
                model: deploymentId,
                messages: [
                    {
                        role: "system",
                        content: `You are a professional technical interview evaluator.

Analyze the candidate's answer carefully.

Provide detailed, constructive feedback using this exact structure:

Relevance:
Explain how relevant the answer is.

Tone:
Evaluate the candidate's communication tone.

Technical Accuracy:
Evaluate the correctness of the technical explanation.

Score:
Give a score out of 10 and explain why.

Strengths:
Explain everything the candidate did well.

Weaknesses:
Identify missing concepts, mistakes and gaps.

Suggestions:
Provide specific, actionable improvements.

Improved Answer:
Write a complete, technically accurate example of an excellent interview answer.

Keep every section detailed and meaningful.
Do not give one-line feedback.
Do not omit any section.`
                    },
                    {
                        role: "user",
                        content: `Interview Question:
${question}

Candidate's Answer:
${answer}

Evaluate this answer in detail.`
                    }
                ],
                max_completion_tokens: 2500,
                temperature: 0.6
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            }
        );

        const rawFeedback =
            response.data.choices[0].message.content?.trim();

        if (!rawFeedback) {
            throw new Error("AI returned an empty feedback response.");
        }

        // Extract complete multiline sections
        const extractSection = (label, nextLabels) => {
            const next = nextLabels.join("|");
            const regex = new RegExp(
                `^${label}:\\s*([\\s\\S]*?)(?=^(${next}):|$)`,
                "im"
            );

            const match = rawFeedback.match(regex);
            return match?.[1]?.trim() || "Not provided";
        };

        const labels = [
            "Relevance",
            "Tone",
            "Technical Accuracy",
            "Score",
            "Strengths",
            "Weaknesses",
            "Suggestions",
            "Improved Answer"
        ];

        const feedback = {
            relevance: extractSection("Relevance", labels.slice(1)),
            tone: extractSection("Tone", labels.slice(2)),
            technicalAccuracy: extractSection("Technical Accuracy", labels.slice(3)),
            score: extractSection("Score", labels.slice(4)),
            strengths: extractSection("Strengths", labels.slice(5)),
            weaknesses: extractSection("Weaknesses", labels.slice(6)),
            suggestions: extractSection("Suggestions", labels.slice(7)),
            improvedAnswer: extractSection("Improved Answer", []),
            fullFeedback: rawFeedback
        };

        context.res = {
            status: 200,
            body: { feedback }
        };

    } catch (err) {
        context.log.error(
            "Azure OpenAI evaluation error:",
            err.response?.data || err.message
        );

        context.res = {
            status: 500,
            body: {
                error: "Failed to evaluate the answer."
            }
        };
    }
};
