const { AzureOpenAI } = require("openai");

let client = null;

// Build the client only on first real use, not at import time.
// In mock mode this never runs, so missing creds won't crash startup.
function getClient() {
  if (!client) {
    client = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-10-21",
    });
  }
  return client;
}

const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

module.exports = { getClient, deployment };
