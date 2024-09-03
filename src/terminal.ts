import * as vscode from "vscode";
import * as command from "./command";

interface OeisTerminalLink extends vscode.TerminalLink {
    data: string;
}

export class OeisSearchLinkProvider implements vscode.TerminalLinkProvider {
    provideTerminalLinks(
        context: vscode.TerminalLinkContext,
        token: vscode.CancellationToken,
    ): vscode.ProviderResult<OeisTerminalLink[]> {
        // matches:
        // "1,2,3,4"
        // "1, 2, 3, 4"
        // "[1,2,3,4]"
        // "[1, 2, 3, 4]"
        // 1, 2, 3...
        const matchesSequence = /\[?(\d+, ?)+ ?\d+\]?/g;
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
        vscode.commands.executeCommand(command.names.executeSearch, link.data);
    }
}

export class OeisSequenceLinkProvider implements vscode.TerminalLinkProvider {
    provideTerminalLinks(
        context: vscode.TerminalLinkContext,
        token: vscode.CancellationToken,
    ): vscode.ProviderResult<OeisTerminalLink[]> {
        const matchesSequence = /A\d{6}/g;
        const matches = [...context.line.matchAll(matchesSequence)];

        if (!matches) {
            return [];
        }

        const links = matches.map((m) => {
            return {
                length: m[0].length,
                startIndex: m.index,
                tooltip: "Show Sequence",
                data: m[0],
            } as OeisTerminalLink;
        });
        return links;
    }

    handleTerminalLink(link: OeisTerminalLink): vscode.ProviderResult<void> {
        vscode.commands.executeCommand(command.names.showSequence, link.data);
    }
}
