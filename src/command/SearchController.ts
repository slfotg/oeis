import * as vscode from "vscode";
import { SequenceViewController } from ".";
import { SequenceInfo, SequenceProvider } from "../sequence";

/**
 * Items to display in the search results.
 */
interface SearchResults extends vscode.QuickPickItem {
    label: string;
    description: string;
    detail: string;
}

export class SearchController {
    private sequenceProvider: SequenceProvider;
    private sequenceViewController: SequenceViewController;

    constructor(
        sequenceProvider: SequenceProvider,
        sequenceViewController: SequenceViewController,
    ) {
        this.sequenceProvider = sequenceProvider;
        this.sequenceViewController = sequenceViewController;
    }
    /**
     * Opens input box to search for a sequence.
     */
    search() {
        vscode.window
            .showInputBox({
                placeHolder: "2,1,3,4,7,11",
            })
            .then(this.executeSearch);
    }

    executeSearch(searchText?: string) {
        if (!searchText) {
            return;
        }
        this._executeSearch(searchText);
    }

    /**
     * Searches for the selected text in the active editor.
     *
     * This function is called when the user selects text in the editor and then
     * runs the "Search Selected Text" command from the context menu.
     */
    searchSelectedText() {
        const searchText = vscode.window.activeTextEditor?.document.getText(
            vscode.window.activeTextEditor?.selection,
        );
        this.executeSearch(searchText);
    }

    /**
     * Converts a sequence info to a search result.
     * @param sequenceInfo information about a single sequence
     * @returns a view item for the search results
     */
    toSearchResults(sequenceInfo: SequenceInfo): SearchResults {
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
    async showSearchResults(
        searchText: string,
        sequences: SequenceInfo[],
    ): Promise<SearchResults | undefined> {
        return vscode.window.showQuickPick(
            sequences.map(this.toSearchResults),
            {
                title: `Search results for ${searchText}`,
                ignoreFocusOut: true,
                matchOnDescription: true,
                matchOnDetail: true,
            },
        );
    }

    private async _executeSearch(searchText: string) {
        const sequences = await this.sequenceProvider.search(searchText);
        if (sequences.length > 0) {
            const item = await this.showSearchResults(searchText, sequences);
            this.sequenceViewController.showSequence(item?.label);
        } else {
            vscode.window.showWarningMessage(
                `No sequences found for ${searchText}.`,
            );
        }
    }
}
