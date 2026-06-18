export interface ChatStreamChunk {
    id: string;
    object: string;
    created: number;
    choices: Array<{
        index: number;
        delta: {
            content?: string;
        };
    }>;
}
export interface ChatMessage{
    
}