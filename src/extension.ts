import * as vscode from 'vscode';
import { InlineCompletionProvider } from './providers/inlineCompletionProvider';

let provider: InlineCompletionProvider | undefined;
let outputChannel: vscode.OutputChannel | undefined;

export function activate(context: vscode.ExtensionContext) {

	const outputChannel = vscode.window.createOutputChannel('Tab Completion');
	outputChannel.appendLine('Tab Completion extension activated');

	provider = new InlineCompletionProvider(outputChannel);
	const providerDisposale = vscode.languages.registerInlineCompletionItemProvider(
		{pattern:'**'},
		provider
	);
	
	context.subscriptions.push(providerDisposale);
}

// This method is called when your extension is deactivated
export function deactivate() {}
