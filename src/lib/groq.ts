import axios, { type AxiosInstance } from "axios";
import { AI_LANGUAGE_INSTRUCTIONS, type LanguageCode } from "./i18n";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const MAX_RETRIES = 2;
const TIMEOUT_MS = 60_000;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqResponse {
  content: string;
  model: string;
  tokens: number;
}

function createClient(): AxiosInstance {
  const apiKey = process.env.GROQ_API_KEY;
  return axios.create({
    baseURL: GROQ_BASE_URL,
    timeout: TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    language?: LanguageCode;
  } = {}
): Promise<GroqResponse> {
  const { model = DEFAULT_MODEL, temperature = 0.5, maxTokens = 1200, language = "en" } = options;

  if (!isGroqConfigured()) {
    return {
      content:
        "⚠️ Groq API key is not configured. Please set the GROQ_API_KEY environment variable to enable AI features. The administrator can add this key in the project's .env file.",
      model: "none",
      tokens: 0,
    };
  }

  const langInstruction = AI_LANGUAGE_INSTRUCTIONS[language] ?? AI_LANGUAGE_INSTRUCTIONS.en;
  const systemMessage: ChatMessage = {
    role: "system",
    content: `You are HarvestIQ, an expert AI agriculture assistant. Provide accurate, practical, and actionable farming advice. Be concise and use simple language. ${langInstruction} If a question is not agriculture-related, politely redirect to farming topics.`,
  };

  const client = createClient();
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.post("/chat/completions", {
        model,
        messages: [systemMessage, ...messages],
        temperature,
        max_tokens: maxTokens,
      });
      const content: string = response.data?.choices?.[0]?.message?.content ?? "";
      const usedModel: string = response.data?.model ?? model;
      const usage = response.data?.usage;
      const tokens: number =
        usage?.total_tokens ?? (usage?.prompt_tokens ?? 0) + (usage?.completion_tokens ?? 0);
      return { content, model: usedModel, tokens };
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await sleep(800 * (attempt + 1));
        continue;
      }
    }
  }

  const message =
    axios.isAxiosError(lastError)
      ? lastError.response?.data?.error?.message ?? lastError.message
      : "Unknown error from Groq API";
  return {
    content: `⚠️ Unable to reach the AI service. ${message}. Please try again in a moment.`,
    model,
    tokens: 0,
  };
}

export async function getStructuredAdvice(
  prompt: string,
  context: Record<string, string>,
  language: LanguageCode = "en"
): Promise<string> {
  const contextStr = Object.entries(context)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const messages: ChatMessage[] = [
    {
      role: "user",
      content: `Farmer context:\n${contextStr}\n\nQuestion: ${prompt}\n\nProvide a detailed, structured response with sections (Use headings like ## Overview, ## Steps, ## Precautions).`,
    },
  ];
  const res = await chatCompletion(messages, { language, temperature: 0.4 });
  return res.content;
}
