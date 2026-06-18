import * as vscode from 'vscode';
import { getConfig } from '../services/configurationService';
import { ChatMessage, ChatStreamChunk } from '../utils/types';

export type ApiProvider = 'openrouter' | 'groq' | 'fireworks';

interface ProviderConfig {
    endpoint: string;
    getApiKey: () => string;
    getModel: () => string;
}

const PROVIDER_CONFIG: Record<ApiProvider, ProviderConfig> = {
    openrouter: {
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        getApiKey: () => getConfig().openrouterApiKey,
        getModel: () => getConfig().model,
    },

    groq: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        getApiKey: () => getConfig().groqApiKey,
        getModel: () => getConfig().model,
    },

    fireworks: {
        endpoint: 'https://api.fireworks.ai/inference/v1/chat/completions',
        getApiKey: () => getConfig().fireworksApiKey,
        getModel: () => getConfig().model,
    }
};

export class ApiClient implements vscode.Disposable {

    private readonly outputChannel: vscode.OutputChannel;
    private pendingRequest: AbortController | null = null;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    private getActiveProvider(): ApiProvider | null {
        const config = getConfig();

        if (config.openrouterApiKey) {
            return 'openrouter';
        }

        if (config.groqApiKey) {
            return 'groq';
        }

        if (config.fireworksApiKey) {
            return 'fireworks';
        }

        return null;
    }

    async complete(
        messages: ChatMessage[],
        options: {
            maxTokens?: number;
        } = {}
    ): Promise<AsyncGenerator<string, void, unknown>> {

        const provider = this.getActiveProvider();

        if (!provider) {
            throw new Error('No API key configured');
        }

        this.cancel();

        this.pendingRequest = new AbortController();

        const config = getConfig();
        const providerConfig = PROVIDER_CONFIG[provider];

        const maxTokens = options.maxTokens ?? config.maxTokens;
        const model = providerConfig.getModel();

        const body: Record<string, unknown> = {
            model,
            messages,
            max_tokens: maxTokens,
            stream: true,
            temperature: 0.1
        };

        this.log(
            `[${provider}] Request: model=${model}, max_tokens=${maxTokens}`
        );

        return this.streamRequest(
            providerConfig.endpoint,
            body,
            providerConfig.getApiKey(),
            this.pendingRequest.signal
        );
    }

    cancel(): void {
        if (this.pendingRequest) {
            this.pendingRequest.abort();
            this.pendingRequest = null;
        }
    }

    private async *streamRequest(
        endpoint: string,
        body: Record<string, unknown>,
        apiKey: string,
        signal: AbortSignal
    ): AsyncGenerator<string, void, unknown> {

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            signal
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `API error ${response.status}: ${errorText}`
            );
        }

        if (!response.body) {
            throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = '';

        try {
            while (true) {

                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, {
                    stream: true
                });

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {

                    if (!line.startsWith('data:')) {
                        continue;
                    }

                    const data = line.slice(5).trim();

                    if (data === '[DONE]') {
                        return;
                    }

                    try {
                        const chunk =
                            JSON.parse(data) as ChatStreamChunk;

                        const content =
                            chunk.choices?.[0]?.delta?.content;

                        if (content) {
                            yield content;
                        }

                    } catch (error) {
                        this.log(
                            `Parse error: ${String(error)}`
                        );
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    private log(message: string): void {
        this.outputChannel.appendLine(
            `[ApiClient] ${message}`
        );
    }

    dispose(): void {
        this.cancel();
    }
}