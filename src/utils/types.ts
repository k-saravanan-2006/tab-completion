import * as vscode from 'vscode';

export interface ChatStreamChunk {
    id: string;
    object: string;
    created: number;
    choices: Array<{
        index: number;
        delta: {
            content?: string;
        };
        finish_reason:string | null;
    }>;
}
export interface ChatMessage{
    role:'system' | 'user' | 'assistant';
    content: string;
}

export interface ReplacementEdit {
    deleteRange: vscode.Range;
    insertText: string;
    deletedText: string;
    _actualDeleteRange: vscode.Range | undefined;
}

export interface PendingCompletion {
    dcumentUri: string;
    edit: ReplacementEdit;
}