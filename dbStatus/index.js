const cosmos = require('../shared/cosmosClient');

module.exports = async function (context, req) {
    const configured = cosmos.isCosmosConfigured();

    context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
            configured: configured,
            provider: configured ? "Azure Cosmos DB" : "Browser Local Storage (Fallback)",
            database: cosmos.DATABASE_NAME,
            container: cosmos.CONTAINER_NAME,
            status: configured ? "connected" : "ready_for_credentials"
        }
    };
};
