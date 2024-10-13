import * as vscode from "vscode";
import * as command from "./command";
import { OeisViewProvider } from "./panel";
import { getSequenceProvider } from "./sequence";
import { OeisSearchLinkProvider, OeisSequenceLinkProvider } from "./terminal";

export function activate(context: vscode.ExtensionContext) {
    const sequenceProvider = getSequenceProvider(context.workspaceState);

    const panel = vscode.window.registerWebviewViewProvider(
        OeisViewProvider.viewType,
        new OeisViewProvider(context.extensionUri),
    );

    const searchCommand = vscode.commands.registerCommand(
        command.names.search,
        () => {
            command.search();
        },
    );

    const executeSearchCommand = vscode.commands.registerCommand(
        command.names.executeSearch,
        (searchText?: string) => {
            if (!searchText) {
                return;
            }
            command.executeSearch(searchText, sequenceProvider);
        },
    );

    const searchSelectedTextCommand = vscode.commands.registerCommand(
        command.names.searchSelectedText,
        command.searchSelectedText,
    );

    const showSequenceCommand = vscode.commands.registerCommand(
        command.names.showSequence,
        function (sequenceId?: string) {
            if (!sequenceId) {
                return;
            }
            command.showSequence(context, sequenceId, sequenceProvider);
        },
    );

    const searchLinkProvider = vscode.window.registerTerminalLinkProvider(
        new OeisSearchLinkProvider(),
    );
    const sequenceLinkProvider = vscode.window.registerTerminalLinkProvider(
        new OeisSequenceLinkProvider(),
    );

    context.subscriptions.push(
        panel,
        executeSearchCommand,
        searchCommand,
        searchSelectedTextCommand,
        showSequenceCommand,
        searchLinkProvider,
        sequenceLinkProvider,
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
