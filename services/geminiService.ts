
import { GoogleGenAI, Type } from "@google/genai";
import type { Settings, GeminiResponse, FactCheckResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A concise summary of the entire conversation transcript provided.",
        },
        entities: {
            type: Type.ARRAY,
            description: "A list of key people, places, organizations, or topics mentioned.",
            items: { type: Type.STRING },
        },
        suggestedReplies: {
            type: Type.ARRAY,
            description: "3-5 intelligent, natural-sounding potential responses the user could make.",
            items: {
                type: Type.OBJECT,
                properties: {
                    reply: {
                        type: Type.STRING,
                        description: "The text of the suggested reply."
                    },
                    confidence: {
                        type: Type.NUMBER,
                        description: "A confidence score from 0.0 to 1.0 on how relevant this reply is."
                    },
                },
                required: ["reply", "confidence"],
            },
        },
    },
    required: ["summary", "entities", "suggestedReplies"],
};


export const getInsightsAndReplies = async (transcript: string, settings: Settings): Promise<GeminiResponse> => {
    const model = 'gemini-2.5-flash';

    const systemInstruction = `You are a conversational intelligence assistant. Your goal is to help the user understand and engage with a live audio conversation.
Analyze the following transcript and provide:
1.  A brief, running summary of the conversation.
2.  A list of key entities (people, places, topics).
3.  A few intelligent, context-aware replies the user could say next.

The user's preferred conversational tone is: "${settings.tone}".
Incorporate the following from the user's personal knowledge base when relevant: "${settings.knowledgeBase}".
The entire transcript so far is:
---
${transcript}
---
Provide your response in a structured JSON format.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: systemInstruction,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
        return parsedResponse;

    } catch (error: any) {
        console.error("Error fetching insights from Gemini:", error);
        if (error?.error?.status === 'RESOURCE_EXHAUSTED' || error?.error?.code === 429) {
            throw new Error("API rate limit reached. Insights will update again shortly.");
        }
        throw new Error("Failed to process the conversation.");
    }
};

export const factCheckWithGemini = async (entity: string): Promise<Omit<FactCheckResult, 'entity'>> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Provide a brief, factual summary about "${entity}" and cite your sources. Your information must be up-to-date.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const summary = response.text;
        const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources = rawChunks?.map((chunk: any) => ({
            uri: chunk.web.uri,
            title: chunk.web.title,
        })) || [];

        return { summary, sources };
    } catch (error: any) {
        console.error("Error during fact-check with Gemini:", error);
        if (error?.error?.status === 'RESOURCE_EXHAUSTED' || error?.error?.code === 429) {
            throw new Error("API rate limit reached. Please try fact-checking again in a moment.");
        }
        throw new Error(`Failed to fact-check "${entity}".`);
    }
};
