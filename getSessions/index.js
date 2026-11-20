const cosmos = require('../shared/cosmosClient');

module.exports = async function (context, req) {
    context.log("HTTP trigger: getSessions");

    if (!cosmos.isCosmosConfigured()) {
        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: {
                configured: false,
                source: "localStorage",
                message: "Cosmos DB not configured. Using local storage mode.",
                sessions: []
            }
        };
        return;
    }

    try {
        const sessions = await cosmos.getAllSessions();
        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: {
                configured: true,
                source: "Azure Cosmos DB",
                sessions: sessions
            }
        };
    } catch (err) {
        context.log.error("Error retrieving sessions from Cosmos DB:", err);
        context.res = {
            status: 500,
            headers: { "Content-Type": "application/json" },
            body: {
                error: "Failed to retrieve sessions from database.",
                details: err.message
            }
        };
    }
};
