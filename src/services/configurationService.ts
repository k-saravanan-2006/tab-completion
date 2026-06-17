import * as vscode from 'vscode';

export interface TabCompletionConfig{
    fireworksApiKey: string;
    groqApiKey: string;
    openrouterApiKey: string;

    model: string;
    maxTokens: number;
}

const DEFAULTS: TabCompletionConfig = {
    fireworksApiKey: '',
    groqApiKey: '',
    openrouterApiKey: '',

    model: 'qwen/qwen3-32b',
    maxTokens: 500,
}


export class ConfigurationService implements vscode.Disposable{
    private static instance: ConfigurationService | null = null;
    private cachedConfig = this.loadConfig();
    private readonly Disposable: vscode.Disposable[] = [];
    private readonly changeListeners: Set<(Config: TabCompletionConfig) => void> = new Set();

    private constructor() {
        this.cachedConfig = this.loadConfig();
        this.registerConfigChangrListener();
    }
    registerConfigChangrListener() {
        throw new Error('Method not implemented.');
    }

    static getInstance(): ConfigurationService {
        if(!ConfigurationService.instance) {
            ConfigurationService.instance = new ConfigurationService();
        }

        return ConfigurationService.instance;
    }

    private registerConfigChannelListener(): void{
        this.Disposable.push(
            vscode.workspace.onDidChangeConfiguration((e) => {
                if(e.affectsConfiguration('tab-completion')){
                    this.cachedConfig = this.loadConfig();
                }
            })
        )
    }

    private loadConfig(): TabCompletionConfig{
        const config = vscode.workspace.getConfiguration('tab-completion');

        return {
            fireworksApiKey: config.get<string>('fireworksApiKey',DEFAULTS.fireworksApiKey),
            groqApiKey: config.get<string>('groqApiKey',DEFAULTS.groqApiKey),
            openrouterApiKey: config.get<string>('openrouterApiKey',DEFAULTS.openrouterApiKey),
            maxTokens: config.get<number>('maxTokens',DEFAULTS.maxTokens),
            model: config.get<string>('model',DEFAULTS.model)
        }
    }
    
    dispose() {
        throw new Error('Method not implemented.');
    }

}