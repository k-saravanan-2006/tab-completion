import * as vscode from 'vscode';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider{
    private readonly outputChannel: vscode.OutputChannel;
  
    constructor(outputChannel: vscode.OutputChannel){
            this.outputChannel = outputChannel;
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