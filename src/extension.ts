import * as vscode from "vscode";
import { SearchController } from "./command/SearchController";
import { SequenceViewController } from "./command/SequenceViewController";
import { Command } from "./config";
import { getSequenceProvider } from "./sequence/SequenceProvider";
import {
    OeisSearchLinkProvider,
    OeisSequenceLinkProvider,
} from "./terminal/OeisTerminalLinkProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const sequenceProvider = getSequenceProvider(context.workspaceState);
    const searchController = new SearchController(sequenceProvider);
    const sequenceViewController = new SequenceViewController(
        sequenceProvider,
        context,
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
            Command.ExecuteSearch,
            searchController.executeSearch,
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
        vscode.commands.registerCommand(
            Command.ShowSequence,
            sequenceViewController.showSequence,
            sequenceViewController,
        ),
    );

    context.subscriptions.push(
        vscode.window.registerTerminalLinkProvider(
            new OeisSearchLinkProvider(),
        ),
    );
    context.subscriptions.push(
        vscode.window.registerTerminalLinkProvider(
            new OeisSequenceLinkProvider(),
        ),
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
