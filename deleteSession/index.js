const cosmos = require('../shared/cosmosClient');

module.exports = async function (context, req) {
    context.log("HTTP trigger: deleteSession");

    const id = req.query?.id || req.body?.id;

    if (!id) {
        context.res = {
            status: 400,
            headers: { "Content-Type": "application/json" },
            body: { error: "Missing session id to delete." }
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
                message: "Cosmos DB not configured. Acknowledged deletion for local storage."
            }
        };
        return;
    }

    try {
        const deleted = await cosmos.deleteSession(id);
        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: {
                success: true,
                deleted: deleted,
                source: "Azure Cosmos DB"
            }
        };
    } catch (err) {
        context.log.error("Error deleting session from Cosmos DB:", err);
        context.res = {
            status: 500,
            headers: { "Content-Type": "application/json" },
            body: {
                error: "Failed to delete session from Cosmos DB.",
                details: err.message
            }
        };
    }
};
