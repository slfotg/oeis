import * as vscode from 'vscode';
import { names } from './command';

class SequenceIdLens extends vscode.CodeLens {
    public sequenceId: string;

    constructor(range: vscode.Range, sequenceId: string) {
        super(range);
        this.sequenceId = sequenceId;
    }
}

export class OeisSearchLensProvider implements vscode.CodeLensProvider {
    private codeLenses: SequenceIdLens[] = [];
    private idRegex: RegExp;
    private seqRegex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.idRegex = /A\d{6}/g;
        this.seqRegex = /(\d+, ?)+\d+/g;

        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<SequenceIdLens[]> {
        if (vscode.workspace.getConfiguration("oeis").get("enableCodeLens", true)) {
            this.codeLenses = [];
            const regex = new RegExp(this.idRegex);
            const text = document.getText();
            let matches;
            while ((matches = regex.exec(text)) !== null) {
                const line = document.lineAt(document.positionAt(matches.index).line);
                const indexOf = line.text.indexOf(matches[0]);
                const position = new vscode.Position(line.lineNumber, indexOf);
                const range = document.getWordRangeAtPosition(position, new RegExp(this.idRegex));
                if (range) {
                    this.codeLenses.push(new SequenceIdLens(range, matches[0]));
                }
            }
            return this.codeLenses;
        }
        return [];
    }

    public resolveCodeLens(codeLens: SequenceIdLens, token: vscode.CancellationToken): vscode.ProviderResult<SequenceIdLens> {
        if (vscode.workspace.getConfiguration("oeis").get("enableCodeLens", true)) {
            codeLens.command = {
                title: codeLens.sequenceId,
                tooltip: `Show sequence ${codeLens.sequenceId}`,
                command: names.showSequence,
                arguments: [codeLens.sequenceId]
            };
            return codeLens;
        }
        return null;
    }

}