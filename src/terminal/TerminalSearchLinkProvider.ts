import * as vscode from "vscode";
import { OeisTerminalLink } from ".";
import { SearchController } from "../command";

export class TerminalSearchLinkProvider implements vscode.TerminalLinkProvider {
    private searchController: SearchController;

    constructor(searchController: SearchController) {
        this.searchController = searchController;
    }

    provideTerminalLinks(
        context: vscode.TerminalLinkContext,
        _token: vscode.CancellationToken,
    ): vscode.ProviderResult<OeisTerminalLink[]> {
        // matches:
        // "1,2,3,4"
        // "1, 2, 3, 4"
        // "[1,2,3,4]"
        // "[1, 2, 3, 4]"
        // 1, 2, 3...
        const matchesSequence = /\[?(-?\d+, ?)+ ?-?\d+\]?/g;
        const matches = [...context.line.matchAll(matchesSequence)];

        if (!matches) {
            return [];
        }

        const links = matches.map((m) => {
            return {
                length: m[0].length,
                startIndex: m.index,
                tooltip: "Search Sequence",
                data: m[0],
            } as OeisTerminalLink;
        });
        return links;
    }

    handleTerminalLink(link: OeisTerminalLink): vscode.ProviderResult<void> {
        this.searchController.executeSearch(link.data);
    }
}
