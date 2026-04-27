import * as vscode from "vscode";
import { Command } from "../config";

class SequenceIdLens extends vscode.CodeLens {
    constructor(range: vscode.Range, sequenceId: string) {
        super(range);
        this.command = {
            title: sequenceId,
            tooltip: `Show sequence ${sequenceId}`,
            command: Command.ShowSequence,
            arguments: [sequenceId],
        };
    }
}

export class SequenceLensProvider implements vscode.CodeLensProvider {
    private codeLenses: SequenceIdLens[] = [];
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
        new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> =
        this._onDidChangeCodeLenses.event;

    constructor() {
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(
        document: vscode.TextDocument,
        _token: vscode.CancellationToken,
    ): vscode.ProviderResult<SequenceIdLens[]> {
        if (
            vscode.workspace
                .getConfiguration("oeis")
                .get("enableCodeLens", true)
        ) {
            this.codeLenses = [];
            const idRegex = /A\d{6}/g;
            const text = document.getText();
            let matches;
            while ((matches = idRegex.exec(text)) !== null) {
                const line = document.lineAt(
                    document.positionAt(matches.index).line,
                );
                const indexOf = line.text.indexOf(matches[0]);
                const position = new vscode.Position(line.lineNumber, indexOf);
                const range = document.getWordRangeAtPosition(
                    position,
                    /A\d{6}/,
                );
                if (range) {
                    this.codeLenses.push(new SequenceIdLens(range, matches[0]));
                }
            }
            return this.codeLenses;
        }
        return [];
    }

    public resolveCodeLens(
        codeLens: SequenceIdLens,
        _token: vscode.CancellationToken,
    ): vscode.ProviderResult<SequenceIdLens> {
        if (
            vscode.workspace
                .getConfiguration("oeis")
                .get("enableCodeLens", true)
        ) {
            return codeLens;
        }
        return null;
    }

    public toggleCodeLens() {
        const enabled = vscode.workspace
            .getConfiguration("oeis")
            .get("enableCodeLens", true);
        vscode.workspace
            .getConfiguration("oeis")
            .update("enableCodeLens", !enabled, true);
    }
}
