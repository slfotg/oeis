import * as vscode from "vscode";
import { getHtml } from "./html";
import { SequenceInfo, SequenceProvider } from "./sequence";

const commandPrefix = "oeis";
export const names = {
    search: `${commandPrefix}.search`,
    executeSearch: `${commandPrefix}.executeSearch`,
    showSequence: `${commandPrefix}.showSequence`,
    searchSelectedText: `${commandPrefix}.searchSelectedText`,
};

/**
 * Opens input box to search for a sequence.
 */
export async function search() {
    vscode.commands.executeCommand(
        names.executeSearch,
        await vscode.window.showInputBox({
            placeHolder: "2,1,3,4,7,11",
        }),
    );
}

/**
 * Items to display in the search results.
 */
interface SearchResults extends vscode.QuickPickItem {
    label: string;
    description: string;
    detail: string;
}

/**
 * Converts a sequence info to a search result.
 * @param sequenceInfo information about a single sequence
 * @returns a view item for the search results
 */
function toSearchResults(sequenceInfo: SequenceInfo): SearchResults {
    return {
        label: sequenceInfo.sequenceId,
        description: sequenceInfo.name,
        detail: `[${sequenceInfo.data}]`,
    } as SearchResults;
}

/**
 * Shows search results in a VSCode quick pick.
 * @param searchText the query text
 * @param sequences array of sequence information returned by the search
 * @returns the selected sequence or undefined if none was selected
 */
async function showSearchResults(
    searchText: string,
    sequences: SequenceInfo[],
): Promise<SearchResults | undefined> {
    return vscode.window.showQuickPick(sequences.map(toSearchResults), {
        title: `Search results for ${searchText}`,
        ignoreFocusOut: true,
        matchOnDescription: true,
        matchOnDetail: true,
    });
}

export async function executeSearch(
    searchText: string,
    sequenceProvider: SequenceProvider,
) {
    const sequences = await sequenceProvider.search(searchText);
    const item = await showSearchResults(searchText, sequences);
    vscode.commands.executeCommand(names.showSequence, item?.label);
}

/**
 * Searches for the selected text in the active editor.
 *
 * This function is called when the user selects text in the editor and then
 * runs the "Search Selected Text" command from the context menu.
 */
export function searchSelectedText() {
    const searchText = vscode.window.activeTextEditor?.document.getText(
        vscode.window.activeTextEditor?.selection,
    );
    vscode.commands.executeCommand(names.executeSearch, searchText);
}

export async function showSequence(
    context: vscode.ExtensionContext,
    sequenceId: string,
    sequenceProvider: SequenceProvider,
) {
    const resourceLocation = context.extensionUri;
    let panel = vscode.window.createWebviewPanel(
        commandPrefix,
        sequenceId,
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            enableFindWidget: true,
            retainContextWhenHidden: true,
        },
    );
    const html = await getHtml(
        panel.webview,
        context.extensionUri,
        sequenceId,
        sequenceProvider,
        resourceLocation,
    );
    panel.webview.html = html;

    // handle when sequences are clicked in the current webview
    panel.webview.onDidReceiveMessage(
        (message) => {
            vscode.commands.executeCommand(names.showSequence, message);
        },
        undefined,
        context.subscriptions,
    );
}
