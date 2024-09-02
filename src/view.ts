import * as vscode from 'vscode';
import { getHtml } from './html';
import { commandPrefix, names } from './command';
import { SequenceProvider } from './sequence';

export class SequenceViewManager {
    private visibleSequences: { [key: string]: vscode.WebviewPanel } = {};
    private sequenceProvider: SequenceProvider;
    private context: vscode.ExtensionContext;

    constructor(sequenceProvider: SequenceProvider, context: vscode.ExtensionContext) {
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

    public async showSequence(sequenceId: string) {
        if (this.sequenceViewExists(sequenceId)) {
            this.openSequenceView(sequenceId);
            return;
        }
        const resourceLocation = this.context.extensionUri;
        let panel = vscode.window.createWebviewPanel(
            commandPrefix,
            sequenceId,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                enableFindWidget: true,
            }
        );
        this.registerSequenceView(sequenceId, panel);

        // handle when sequences are clicked in the current webview
        panel.webview.onDidReceiveMessage(
            message => {
                vscode.commands.executeCommand(names.showSequence, message);
            },
            undefined,
            this.context.subscriptions
        );
        const html = await getHtml(panel.webview, this.context.extensionUri, sequenceId, this.sequenceProvider, resourceLocation);
        panel.webview.html = html;
    }
}