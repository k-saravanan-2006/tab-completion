import * as vscode from 'vscode';

export interface TabCompletionConfig {
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
};

export class ConfigurationService implements vscode.Disposable {

    private static instance: ConfigurationService | null = null;

    private cachedConfig: TabCompletionConfig;
    private readonly disposables: vscode.Disposable[] = [];
    private readonly changeListeners:
        Set<(config: TabCompletionConfig) => void> = new Set();

    private constructor() {
        this.cachedConfig = this.loadConfig();
        this.registerConfigChannelListener();
    }

    static getInstance(): ConfigurationService {
        if (!ConfigurationService.instance) {
            ConfigurationService.instance = new ConfigurationService();
        }

        return ConfigurationService.instance;
    }

    private registerConfigChannelListener(): void {
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('tab-completion')) {
                    this.cachedConfig = this.loadConfig();
                    this.notifyListeners();
                }
            })
        );
    }

    private loadConfig(): TabCompletionConfig {
        const config = vscode.workspace.getConfiguration('tab-completion');

        return {
            fireworksApiKey: config.get(
                'fireworksApiKey',
                DEFAULTS.fireworksApiKey
            ),
            groqApiKey: config.get(
                'groqApiKey',
                DEFAULTS.groqApiKey
            ),
            openrouterApiKey: config.get(
                'openrouterApiKey',
                DEFAULTS.openrouterApiKey
            ),
            maxTokens: config.get(
                'maxTokens',
                DEFAULTS.maxTokens
            ),
            model: config.get(
                'model',
                DEFAULTS.model
            )
        };
    }

    private notifyListeners(): void {
        for (const listener of this.changeListeners) {
            try {
                listener(this.cachedConfig);
            } catch (error) {
                console.error(error);
            }
        }
    }

    get fireworksApiKey(): string {
        return this.cachedConfig.fireworksApiKey;
    }

    get groqApiKey(): string {
        return this.cachedConfig.groqApiKey;
    }

    get openrouterApiKey(): string {
        return this.cachedConfig.openrouterApiKey;
    }

    get maxTokens(): number {
        return this.cachedConfig.maxTokens;
    }

    get model(): string {
        return this.cachedConfig.model;
    }

    getConfig(): TabCompletionConfig {
        return this.cachedConfig;
    }

    onConfigChange(
        callback: (config: TabCompletionConfig) => void
    ): vscode.Disposable {

        this.changeListeners.add(callback);

        return {
            dispose: () => {
                this.changeListeners.delete(callback);
            }
        };
    }

    dispose(): void {
        vscode.Disposable.from(...this.disposables).dispose();
        this.changeListeners.clear();
    }
}

export function getConfig(): ConfigurationService {
    return ConfigurationService.getInstance();
}