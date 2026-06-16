import * as vscode from 'vscode';
export type APiProvide = 'openrouter' | 'groq' | 'firework';
interface ProviderConfig {
    endpoint: string;
    getApiKey: () => string;
    getMOdel: () => string;

}
const PROVIDER_CONFIG: record<APiProvide,ProviderConfig> = {
    openrouter: {
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        gerApiKey: ,
        getModel; ,
    },
    groq: {
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        gerApiKey: ,
        getModel; ,
    },
    fireworks: {
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        gerApiKey: ,
        getModel; ,
    }
}

export class ApiClient implements vscode.Disposable{
    dispose() {
         
    }
}