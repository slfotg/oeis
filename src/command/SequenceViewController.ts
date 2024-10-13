import * as vscode from "vscode";
import { ViewType } from "../config";
import { SequenceProvider } from "../sequence";
import { SequenceView } from "../view";

export class SequenceViewController {
    private visibleSequences: { [key: string]: vscode.WebviewPanel } = {};
    private sequenceProvider: SequenceProvider;
    private context: vscode.ExtensionContext;

    constructor(
        sequenceProvider: SequenceProvider,
        context: vscode.ExtensionContext,
    ) {
        this.sequenceProvider = sequenceProvider;
        this.context = context;
    }

    public registerSequenceView(sequenceId: string, view: vscode.WebviewPanel) {
        this.visibleSequences[sequenceId] = view;

        view.onDidDispose(() => {
            delete this.visibleSequences[sequenceId];
        });
    }

    public openSequenceView(sequenceId: string) {
        const view = this.visibleSequences[sequenceId];
        if (!view) {
            throw new Error(`Sequence view ${sequenceId} not found`);
        }
        view.reveal();
    }

    private sequenceViewExists(sequenceId: string) {
        return !!this.visibleSequences[sequenceId];
    }

    showSequence(sequenceId?: string) {
        if (!sequenceId) {
            return;
        }
        if (this.sequenceViewExists(sequenceId)) {
            this.openSequenceView(sequenceId);
            return;
        }
        this._showSequence(sequenceId);
    }

    private async _showSequence(sequenceId: string) {
        const resourceLocation = this.context.extensionUri;
        let panel = vscode.window.createWebviewPanel(
            ViewType.SequencePage,
            sequenceId,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                enableFindWidget: true,
            },
        );
        this.registerSequenceView(sequenceId, panel);

        // handle when sequences are clicked in the current webview
        panel.webview.onDidReceiveMessage(
            (message) => {
                this.showSequence(message);
            },
            undefined,
            this.context.subscriptions,
        );
        const sequenceView = new SequenceView(
            panel.webview,
            this.context.extensionUri,
            sequenceId,
            this.sequenceProvider,
            resourceLocation,
        );
        const html = await sequenceView.getHtml();
        panel.webview.html = html;
    }
}
