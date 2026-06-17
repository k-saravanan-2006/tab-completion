import * as vscode from 'vscode';
import { getConfig } from '../services/configurationService';
import { header } from 'express-validator';
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
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        getApiKey: () => getConfig().groqApiKey,
        getModel: () => getConfig().model,
    },
    fireworks: {
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        getApiKey: () => getConfig().fireworksApiKey,
        getModel: () => getConfig().model,
    }
};

export class ApiClient implements vscode.Disposable {
    private async* streamRequest(
        endpoint: string,
        body: Record<string, unknown>,
        apiKey: string,
        signal: AbortSignal,
    ): AsyncGenerator<string, void, unknown> {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });

        if(!response.ok){
            const errorText = await response.text();
            throw new Error(`API error ${response.status}: ${errorText}`);
        }

        if(!response.body){
            throw new Error('NO response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try{
            while(true){
                const {done, value} = await reader.read();
                if(done){
                    break;
                }

                buffer += decoder.decode(value,{stream:true});
                console.log(buffer)
            }
        }finally{
            reader.releaseLock();
        }
    }
    dispose() {

    }
}