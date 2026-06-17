const { BlobServiceClient } = require("@azure/storage-blob");

const USE_MOCK = process.env.USE_MOCK === "true";
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER || "analyses";

const mockStore = []; // in-memory, mock mode only

function getContainerClient() {
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(containerName);
}

async function saveAnalysis(record) {
  if (USE_MOCK) {
    mockStore.unshift(record);
    console.log("[MOCK] Stored in memory:", record.id);
    return { stored: true, mock: true };
  }
  const containerClient = getContainerClient();
  await containerClient.createIfNotExists();
  const blockBlob = containerClient.getBlockBlobClient(`${record.id}.json`);
  const body = JSON.stringify(record, null, 2);
  await blockBlob.upload(body, Buffer.byteLength(body), {
    blobHTTPHeaders: { blobContentType: "application/json" },
  });
  return { stored: true, blobName: `${record.id}.json` };
}

async function listAnalyses() {
  if (USE_MOCK) return mockStore;
  const containerClient = getContainerClient();
  await containerClient.createIfNotExists();
  const records = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    const blockBlob = containerClient.getBlockBlobClient(blob.name);
    const buffer = await blockBlob.downloadToBuffer();
    records.push(JSON.parse(buffer.toString()));
  }
  records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return records;
}

async function getAnalysisById(id) {
  if (USE_MOCK) return mockStore.find((r) => r.id === id) || null;
  const containerClient = getContainerClient();
  const blockBlob = containerClient.getBlockBlobClient(`${id}.json`);
  if (!(await blockBlob.exists())) return null;
  const buffer = await blockBlob.downloadToBuffer();
  return JSON.parse(buffer.toString());
}

module.exports = { saveAnalysis, listAnalyses, getAnalysisById };
