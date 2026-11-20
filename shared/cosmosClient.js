const { CosmosClient } = require("@azure/cosmos");

let client = null;
let database = null;
let container = null;
let isInitialized = false;

const DATABASE_NAME = process.env.COSMOS_DB_DATABASE_NAME || "interviewDB";
const CONTAINER_NAME = process.env.COSMOS_DB_CONTAINER_NAME || "sessions";

function isCosmosConfigured() {
    const connStr = process.env.COSMOS_DB_CONNECTION_STRING;
    return Boolean(connStr && connStr.trim() && !connStr.includes("your_cosmos_connection_string"));
}

async function initCosmos() {
    if (isInitialized && container) return container;
    if (!isCosmosConfigured()) {
        throw new Error("COSMOS_DB_CONNECTION_STRING is not configured in local.settings.json");
    }

    const connStr = process.env.COSMOS_DB_CONNECTION_STRING.trim();
    client = new CosmosClient(connStr);

    // Auto-create database and container if they don't exist yet
    const { database: db } = await client.databases.createIfNotExists({ id: DATABASE_NAME });
    database = db;

    const { container: cont } = await database.containers.createIfNotExists({
        id: CONTAINER_NAME,
        partitionKey: { paths: ["/id"] },
    });
    container = cont;
    isInitialized = true;
    return container;
}

/**
 * Upsert (insert or replace) an interview session
 */
async function upsertSession(session) {
    if (!session || !session.id) {
        throw new Error("Invalid session: missing id.");
    }
    const cont = await initCosmos();
    const doc = {
        ...session,
        id: String(session.id),
        updatedAt: new Date().toISOString(),
    };
    const { resource } = await cont.items.upsert(doc);
    return resource;
}

/**
 * Get all sessions ordered by creation date descending
 */
async function getAllSessions() {
    const cont = await initCosmos();
    const querySpec = {
        query: "SELECT * FROM c ORDER BY c.createdAt DESC"
    };

    try {
        const { resources } = await cont.items.query(querySpec).fetchAll();
        return resources || [];
    } catch (err) {
        // Fallback without ORDER BY if indexing policy is default and hasn't indexed createdAt yet
        const { resources } = await cont.items.readAll().fetchAll();
        return (resources || []).sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });
    }
}

/**
 * Get a specific session by ID
 */
async function getSessionById(id) {
    const cont = await initCosmos();
    try {
        const { resource } = await cont.item(String(id), String(id)).read();
        return resource || null;
    } catch (err) {
        if (err.code === 404) return null;
        throw err;
    }
}

/**
 * Delete a session by ID
 */
async function deleteSession(id) {
    const cont = await initCosmos();
    try {
        await cont.item(String(id), String(id)).delete();
        return true;
    } catch (err) {
        if (err.code === 404) return false;
        throw err;
    }
}

module.exports = {
    isCosmosConfigured,
    initCosmos,
    upsertSession,
    getAllSessions,
    getSessionById,
    deleteSession,
    DATABASE_NAME,
    CONTAINER_NAME,
};
