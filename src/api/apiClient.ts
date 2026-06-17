import * as vscode from 'vscode';
export type ApiProvider = 'openrouter' | 'groq' | 'firework';
interface ProviderConfig {
    endpoint: string;
    getApiKey: () => string;
    getModel: () => string;

}
const PROVIDER_CONFIG: Record<ApiProvider,ProviderConfig> = {
    openrouter: {
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        getApiKey: ,
        getModel: ,
    },
    groq: {
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        getApiKey: ,
        getModel: ,
    },
    fireworks: {
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        getApiKey: ,
        getModel: ,
    }
}

export class ApiClient implements vscode.Disposable{
    dispose() {
         
    }
}