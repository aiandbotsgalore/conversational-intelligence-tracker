
export interface Settings {
    tone: string;
    knowledgeBase: string;
    keywords: string[];
}

export interface SuggestedReply {
    reply: string;
    confidence: number;
}

export interface Insight {
    summary: string;
    entities: string[];
}

export interface GeminiResponse extends Insight {
    suggestedReplies: SuggestedReply[];
}


export interface TranscriptChunk {
    id: string;
    text: string;
    speaker: string;
    timestamp: Date;
}

export interface FactCheckResult {
    entity: string;
    summary:string;
    sources: { title: string; uri: string }[];
}
