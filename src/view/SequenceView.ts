import * as vscode from "vscode";
import * as config from "../config";
import { SequenceProvider } from "../sequence";

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
        const existingLinks: string[] = [];
        let placeholder = 0;

        // Extract and replace existing <a> tags with placeholders
        let result = line.replace(
            /<a[^>]*>.*?<\/a>/g,
            (match) => {
                existingLinks.push(match);
                return `<!--LINK_PLACEHOLDER_${placeholder++}-->`;
            },
        );

        // Escape HTML entities
        result = result
            .replaceAll(/</g, "&lt;")
            .replaceAll(/>/g, "&gt;");

        // Add new links for sequences
        result = result.replaceAll(
            /(A\d{6})/g,
            `<a href="#$1" class="seq-link">$1</a>`,
        );

        // Add links for user names
        result = result.replaceAll(
            /_([a-zA-Z\. ]{3,30})_/g,
            `<a href="${config.wikiURL}/User:$1">$1</a>`,
        );

        // Restore existing links from placeholders
        for (let i = 0; i < existingLinks.length; i++) {
            result = result.replace(
                `<!--LINK_PLACEHOLDER_${i}-->`,
                existingLinks[i],
            );
        }

        return result;
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

    private _displayKeywordSection(line: string) {
        const description = line.split(",").map((word) => {
            const keyword = word as config.Keyword;
            const title = config.keywordDescriptions[keyword];
            if (title) {
                return `<abbr title="${title}">${word}</abbr>`;
            } else {
                return `${word}`;
            }
        });
        return `<br />
                <div class="section">
                    <div class="label">
                        <pre>${config.sections.keyword}</pre>
                    </div>
                    <div class="description">
                        ${description.join(", ")}
                    </div>
                </div>`;
    }

    private _displaySection(label: string, lines?: string | string[]) {
        if (!lines) {
            return "";
        }
        if (label === config.sections.keyword) {
            const keywordStr = Array.isArray(lines) ? lines.join(",") : lines;
            return this._displayKeywordSection(keywordStr);
        } else {
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
