const cosmos = require('../shared/cosmosClient');

module.exports = async function (context, req) {
    context.log("HTTP trigger: saveSession");

    let body = req.body;
    if (typeof body === "string") {
        try {
            body = JSON.parse(body);
        } catch {
            body = {};
        }
    }

    const session = body?.session || body;

    if (!session || !session.id) {
        context.res = {
            status: 400,
            headers: { "Content-Type": "application/json" },
            body: { error: "Missing session or session.id in request body." }
        };
        return;
    }

    if (!cosmos.isCosmosConfigured()) {
        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: {
                configured: false,
                source: "localStorage",
                message: "Cosmos DB not configured. Session acknowledged for local caching.",
                session: session
            }
        };
        return;
    }

    try {
        const saved = await cosmos.upsertSession(session);
        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: {
                success: true,
                source: "Azure Cosmos DB",
                session: saved
            }
        };
    } catch (err) {
        context.log.error("Error saving session to Cosmos DB:", err);
        context.res = {
            status: 500,
            headers: { "Content-Type": "application/json" },
            body: {
                error: "Failed to persist session to Cosmos DB.",
                details: err.message
            }
        };
    }
};
