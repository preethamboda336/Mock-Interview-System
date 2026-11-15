
const axios = require('axios');

module.exports = async function (context, req) {
    let body = req.body;
    context.log("REQUEST BODY:", req.body);
    context.log("RAW BODY:", req.rawBody);
    context.log("CONTENT TYPE:", req.headers?.["content-type"]);

    // Handle raw JSON body if Azure Functions has not parsed it
    if (typeof body === "string") {
        try {
            body = JSON.parse(body);
        } catch {
            body = {};
        }
    }

    if (!body && req.rawBody) {
        try {
            body = JSON.parse(req.rawBody);
        } catch {
            body = {};
        }
    }

    const resumeText = body?.resumeText;

    if (!resumeText) {
        context.res = {
            status: 400,
            body: { error: "Missing resumeText in request body." }
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
                        content: "You are an expert career coach. Generate exactly 3 relevant technical interview questions based on the candidate's resume or job title. Number each question."
                    },
                    {
                        role: "user",
                        content: `Generate 3 technical interview questions based on:\n\n${resumeText}`
                    }
                ],
                max_completion_tokens: 500,
                temperature: 1,
                top_p: 1
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            }
        );

        const content = response.data.choices[0].message.content;

        context.res = {
            status: 200,
            body: {
                questions: content.trim()
                    .split('\n')
                    .filter(q => q.trim())
            }
        };

    } catch (err) {
        context.log.error(
            "Azure OpenAI error:",
            err.response?.data || err.message
        );

        context.res = {
            status: 500,
            body: {
                error: "Failed to generate interview questions."
            }
        };
    }
};
