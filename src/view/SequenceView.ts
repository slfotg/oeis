import * as vscode from "vscode";
import * as config from "../config";
import { SequenceProvider } from "../sequence/SequenceProvider";

export class SequenceView {
    private webview: vscode.Webview;
    private extensionUri: vscode.Uri;
    private sequenceId: string;
    private sequenceProvider: SequenceProvider;
    private resourceLocation: vscode.Uri;

    constructor(
        webview: vscode.Webview,
        extensionUri: vscode.Uri,
        sequenceId: string,
        sequenceProvider: SequenceProvider,
        resourceLocation: vscode.Uri,
    ) {
        this.webview = webview;
        this.extensionUri = extensionUri;
        this.sequenceId = sequenceId;
        this.sequenceProvider = sequenceProvider;
        this.resourceLocation = resourceLocation;
    }
    /**
     * Splits the data (sequence string) into a more readable format.
     * @param data the data to split
     * @returns the split data
     */
    private _splitData(data: string) {
        return data.replace(/,/g, ", ");
    }

    /**
     * Cleans up the links on a single line.
     *
     * 1. Existing links should remain unchanged.
     * 2. A###### should be converted to a link that jumps to the sequence in a new tab.
     * 3. _User Name_ should be converted to a link to the OEIS wiki page for that user.
     * 4. Less than and greater than signs should be converted to HTML entities.
     * @param line
     * @returns
     */
    private _addLinks(line: string) {
        // TODO - This needs to be revisited. The current implementation is very hacky.
        return line
            .replaceAll(
                /\<a([^\>]+)\>(.+?)\<\/a\>/g,
                (_a, b: string, c: string) =>
                    `---- ${b.split("").reverse().join("")} * ${c
                        .split("")
                        .reverse()
                        .join("")} ----`,
            )
            .replaceAll(/\</g, "&lt;")
            .replaceAll(/\>/g, "&gt;")
            .replaceAll(/(A\d{6})/g, `<a href="#$1" class="seq-link">$1</a>`)
            .replaceAll(
                /_([a-zA-Z\. ]{3,30})_/g,
                `<a href="${config.wikiURL}/User:$1">$1</a>`,
            )
            .replaceAll(
                /---- (.+) \* (.+?) ----/g,
                (_a, b: string, c: string) =>
                    `<a ${b.split("").reverse().join("")}>${c
                        .split("")
                        .reverse()
                        .join("")}</a>`,
            );
    }

    private _splitLines(lines: string | string[]) {
        if (typeof lines === "string") {
            return `<div class="seq"><pre>${this._addLinks(lines)}</pre></div>`;
        }
        return lines
            .map(
                (line) =>
                    `<div class="seq"><pre>${this._addLinks(line)}</pre></div>`,
            )
            .join("\n");
    }

    private _displaySection(label: string, lines?: string | string[]) {
        if (!lines) {
            return "";
        }
        return `<br />
            <div class="section">
                <div class="label">
                    <pre>${label}</pre>
                </div>
                <div class="description">
                    ${this._splitLines(lines)}
                </div>
            </div>`;
    }

    async getHtml() {
        const sequenceInfo = await this.sequenceProvider.getSequence(
            this.sequenceId,
        );
        const script = this.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, "media", "script.js"),
        );
        const styleMainUri = this.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, "media", "main.css"),
        );
        const sections = Object.keys(config.sections).map((key) => {
            const label = config.sections[key as config.SectionType];
            const keyTyped = key as keyof typeof sequenceInfo;
            const lines = sequenceInfo[keyTyped];
            if (typeof lines === "number") {
                return "";
            }
            return this._displaySection(label, lines);
        });
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
                    this.webview.cspSource
                }; script-src ${this.webview.cspSource};">
                <link href="${styleMainUri}" rel="stylesheet">
                <title>${this.sequenceId}</title>
            </head>
            <body>
                <div class="content">
                    <h2><pre><a href="${config.url}/${this.sequenceId}">${
            this.sequenceId
        }</a> - ${sequenceInfo.name}</pre></h2>
                    <div>Content is available under <a href="http://oeis.org/LICENSE">The OEIS End-User License Agreement</a></div>
                    <br />
                    <hr />
                    <div class="data">
                        <pre>${this._splitData(sequenceInfo.data)}</pre>
                    </div>
                    <hr />
                    ${sections.join("\n")}
                </div>
                <script src="${script}"></script>
            </body>
            </html>`;
    }
}
