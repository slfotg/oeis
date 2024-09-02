// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getSequenceProvider, SequenceInfoTreeItem } from './sequence';
import { OeisSearchLinkProvider, OeisSequenceLinkProvider } from "./terminal";
import * as command from './command';
import { SequenceViewManager } from './view';
import { OeisSearchLensProvider } from './lens';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const sequenceProvider = getSequenceProvider();
    const sequenceViewManager = new SequenceViewManager(sequenceProvider, context);

    vscode.window.registerTreeDataProvider('oeis.cacheView', sequenceProvider);

    const codelensProvider = new OeisSearchLensProvider();

    vscode.languages.registerCodeLensProvider("*", codelensProvider);

    const searchCommand = vscode.commands.registerCommand(command.names.search, () => {
        command.search();
    });

    const executeSearchCommand = vscode.commands.registerCommand(command.names.executeSearch, (searchText?: string) => {
        if (!searchText) {
            return;
        }
        command.executeSearch(searchText, sequenceProvider, context);
    });

    const searchSelectedTextCommand = vscode.commands.registerCommand(command.names.searchSelectedText, command.searchSelectedText);

    const showSequenceCommand = vscode.commands.registerCommand(command.names.showSequence, function (sequenceId?: string) {
        if (!sequenceId) {
            return;
        }
        sequenceViewManager.showSequence(sequenceId);
    });

    const deleteCachedItem = vscode.commands.registerCommand("oeis.deleteCachedItem", (item: SequenceInfoTreeItem) => {
        sequenceProvider.deleteItem(item);
    });

    const searchLinkProvider = vscode.window.registerTerminalLinkProvider(new OeisSearchLinkProvider());
    const sequenceLinkProvider = vscode.window.registerTerminalLinkProvider(new OeisSequenceLinkProvider());

    const toggleCodeLens = vscode.commands.registerCommand("oeis.toggleCodeLens", () => {
        const enabled = vscode.workspace.getConfiguration("oeis").get("enableCodeLens", true);
        console.log(`CodeLens enabled: ${enabled}`);
        vscode.workspace.getConfiguration("oeis").update("enableCodeLens", !enabled, true);
    });

    context.subscriptions.push(
        executeSearchCommand,
        searchCommand,
        searchSelectedTextCommand,
        showSequenceCommand,
        searchLinkProvider,
        sequenceLinkProvider,
    );
}

// This method is called when your extension is deactivated
export function deactivate() { }
