import * as vscode from 'vscode';
import { SequenceProvider } from "./sequence";

const oeis = {
    url: 'https://oeis.org',
    searchUrl: 'https://oeis.org/search',
    wikiURL: 'https://oeis.org/wiki',
    sections: [
        ['offset', 'Offset'],
        ['comment', 'Comments'],
        ['reference', 'References'],
        ['link', 'Links'],
        ['formula', 'Formula'],
        ['example', 'Example'],
        ['maple', 'Maple'],
        ['mathematica', 'Mathematica'],
        ['program', 'Prog'],
        ['xref', 'Crossrefs'],
        ['keyword', 'Keywords'],
        ['author', 'Author']
    ]
};

/**
 * Splits the data (sequence string) into a more readable format.
 * @param data the data to split
 * @returns the split data
 */
function splitData(data: string) {
    return data.replace(/,/g, ', ');
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
function addLinks(line: string) {
    // TODO - This needs to be revisited. The current implementation is very hacky.
    return line
        .replaceAll(/\<a([^\>]+)\>(.+?)\<\/a\>/g,
            (_a, b: string, c: string) => `---- ${b.split('').reverse().join('')} * ${c.split('').reverse().join('')} ----`)
        .replaceAll(/\</g, "&lt;")
        .replaceAll(/\>/g, "&gt;")
        .replaceAll(/(A\d{6})/g, `<a href="#$1" class="seq-link">$1</a>`)
        .replaceAll(/_([a-zA-Z\. ]{3,30})_/g, `<a href="${oeis.wikiURL}/User:$1">$1</a>`)
        .replaceAll(/---- (.+) \* (.+?) ----/g,
            (_a, b: string, c: string) => `<a ${b.split('').reverse().join('')}>${c.split('').reverse().join('')}</a>`);
}

function splitLines(lines: string | string[]) {
    if (typeof lines === 'string') {
        return `<div class="seq"><tt>${addLinks(lines)}</tt></div>`;
    };
    return lines.map(line => `<div class="seq"><tt>${addLinks(line)}</tt></div>`).join('\n');
}

function displaySection(label: string, lines?: string | string[]) {
    if (!lines) {
        return '';
    }
    return `<br />
            <div class="section">
                <div class="label">
                    <tt>${label}</tt>
                </div>
                <div class="description">
                    ${splitLines(lines)}
                </div>
            </div>`;
}

export async function getHtml(webview: vscode.Webview, extensionUri: vscode.Uri, sequenceId: string, sequenceProvider: SequenceProvider, resourceLocation: vscode.Uri) {
    const sequenceInfo = await sequenceProvider.getSequence(sequenceId);
    const script = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'script.js'));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'main.css'));
    const sections = oeis.sections.map(([key, label]) => {
        const keyTyped = key as keyof typeof sequenceInfo;
        const lines = sequenceInfo[keyTyped];
        if (typeof lines === "number") {
            return "";
        }
        return displaySection(label, lines);
    });
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src ${webview.cspSource};">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleMainUri}" rel="stylesheet">
                <title>${sequenceId}</title>
            </head>
            <body>
                <div class="content">
                    <h2><tt><a href="${oeis.url}/${sequenceId}">${sequenceId}</a> - ${sequenceInfo.name}</tt></h2>
                    <hr />
                    <div class="data">
                        <tt>${splitData(sequenceInfo.data)}</tt>
                    </div>
                    <hr />
                    ${sections.join("\n")}
                </div>
                <script src="${script}"></script>
            </body>
            </html>`;
}