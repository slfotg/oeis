import * as vscode from "vscode";
import { OeisTerminalLink } from ".";
import { SequenceViewController } from "../command";

export class TerminalSequenceLinkProvider
    implements vscode.TerminalLinkProvider
{
    private sequenceViewController: SequenceViewController;

    constructor(sequenceViewController: SequenceViewController) {
        this.sequenceViewController = sequenceViewController;
    }

    provideTerminalLinks(
        context: vscode.TerminalLinkContext,
        _token: vscode.CancellationToken,
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
        this.sequenceViewController.showSequence(link.data);
    }
}
