import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenai(): OpenAI {
  if (_openai) return _openai;

  if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_BASE_URL must be set. Did you forget to provision the OpenAI AI integration?",
    );
  }

  if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_API_KEY must be set. Did you forget to provision the OpenAI AI integration?",
    );
  }

  _openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  return _openai;
}

/**
 * Lazy-initialized OpenAI client.
 *
 * Environment variables (AI_INTEGRATIONS_OPENAI_BASE_URL and
 * AI_INTEGRATIONS_OPENAI_API_KEY) are only validated when the client
 * is first accessed, so importing this module does not crash if they
 * are not yet configured.
 */
export const openai = {
  get chat() {
    return getOpenai().chat;
  },
  get audio() {
    return getOpenai().audio;
  },
  get models() {
    return getOpenai().models;
  },
  get files() {
    return getOpenai().files;
  },
  get batches() {
    return getOpenai().batches;
  },
  get images() {
    return getOpenai().images;
  },
} as OpenAI;
