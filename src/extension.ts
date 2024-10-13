import * as vscode from "vscode";
import { SearchController, SequenceViewController } from "./command";
import { Command } from "./config";
import { getSequenceProvider } from "./sequence";
import {
    TerminalSearchLinkProvider,
    TerminalSequenceLinkProvider,
} from "./terminal";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const sequenceProvider = getSequenceProvider(context.workspaceState);
    const sequenceViewController = new SequenceViewController(
        sequenceProvider,
        context,
    );
    const searchController = new SearchController(
        sequenceProvider,
        sequenceViewController,
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            Command.Search,
            searchController.search,
            searchController,
        ),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            Command.SearchSelectedText,
            searchController.searchSelectedText,
            searchController,
        ),
    );

    context.subscriptions.push(
        vscode.window.registerTerminalLinkProvider(
            new TerminalSearchLinkProvider(searchController),
        ),
    );
    context.subscriptions.push(
        vscode.window.registerTerminalLinkProvider(
            new TerminalSequenceLinkProvider(sequenceViewController),
        ),
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
