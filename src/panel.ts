import * as vscode from "vscode";

export class OeisViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "oeisView";

    private extensionUri: vscode.Uri;

    constructor(private readonly _extensionUri: vscode.Uri) {
        this.extensionUri = _extensionUri;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ): void {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const { cspSource } = webview;
        const bundle = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                "node_modules",
                "@vscode-elements",
                "elements",
                "dist",
                "bundled.js",
            ),
        );

        const componentUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                "frontend",
                "dist",
                "_bundled",
                "my-element.js",
            ),
        );

        const codiconsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                "node_modules",
                "@vscode/codicons",
                "dist",
                "codicon.css",
            ),
        );

        const nonce = getNonce();

        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta
                        http-equiv="Content-Security-Policy"
                        content="
                            default-src 'none';
                            img-src ${cspSource};
                            script-src ${cspSource} nonce-${nonce};
                            style-src 'unsafe-inline' ${cspSource};
                            style-src-elem 'unsafe-inline' ${cspSource};
                            font-src ${cspSource}
                        "
                    />
                    <link href="${codiconsUri}" rel="stylesheet" id="vscode-codicon-stylesheet" />
                    <script src="${componentUri}" nonce="${nonce}" type="module"></script>
                    <title>OEIS View</title>
                </head>
                <body>
                    <h1>OEIS View</h1>
                    <vscode-form-group>
                        <vscode-textfield placeholder="2,1,3,4,7,11">
                            <vscode-icon
                                slot="content-before"
                                name="search"
                                title="search"
                                action-icon
                            ></vscode-icon>
                        </vscode-textfield>
                        <vscode-button type="submit">Search</vscode-button>
                    </vscode-form-group>
                    <vscode-progress-ring></vscode-progress-ring>
                    <my-element name="Sam">Hello</my-element>
                    <script
                        nonce="${nonce}"
                        src="${bundle}"
                        type="module"
                    ></script>
                </body>
                </html>`;
    }
}

function getNonce() {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
