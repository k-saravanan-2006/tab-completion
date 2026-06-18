import * as vscode from 'vscode';
import { ApiClient } from '../api/apiClient';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider{
    private readonly outputChannel: vscode.OutputChannel;
    private readonly ApiClient: ApiClient;
  
    constructor(outputChannel: vscode.OutputChannel){
            this.outputChannel = outputChannel;
            this.ApiClient = new ApiClient(outputChannel);
        }

    async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionList | null> {
        try{
            const prefix = document.getText(
                new vscode.Range(new vscode.Position(0,0),position)
            );
            this.log(`provideInlineCompletionItems called at ${position.line}:${position.character}`);
            const generator = await this.ApiClient.complete(
                [
                    {role: 'system', content: 'complete the code. Output ONLY the competion, no explanation.'},
                    {role: 'user', content: prefix},
                ]
            );
            const newItem = new vscode.InlineCompletionItem(prefix + '!');
            return {'items':[newItem]};
        }catch(error){
            this.log(`Unexpexted error: ${error}`);
            return null;
        }
    }

    private log(message: string): void{
        this.outputChannel.appendLine(`[Provider] ${message}`);
    }
}