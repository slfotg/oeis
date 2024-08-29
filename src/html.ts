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

function getCss(): string {
    return `body {
                padding-left: 30px;
            }

            hr {
                height:1px;
                border-top:1px solid;
                border-bottom:1px solid;
                width: 100%;
            }

            .content {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 60%;
            }

            .data {
                gap: 10px;
                width: 95%;
            }

            .section {
                display: flex;
                flex-direction: row;
                gap: 10px;
                width: 90%;
            }

            .label {
                font-weight: bold;
                order: 1;
                width: 10%;
                border: 1px;
            }

            .description {
                order: 2;
                width: 90%;
            }

            div.seq {
                margin-left: 16px;
                text-align: start;
                text-indent: -16px;
                white-space-collapse: collapse;
                text-wrap: wrap;
            }

            div.seq tt {
                text-indent: -16px;
                white-space-collapse: preserve;
            }`;
}

function getScript(): string {
    return `(function () {
                const vscode = acquireVsCodeApi();
                const links = document.getElementsByClassName("seq-link");

                for (let i = 0; i < links.length; i += 1) {
                    links[i].addEventListener("click", function (e) {
                        e.preventDefault();
                        vscode.postMessage(this.text);
                    });
                }
            }());`;
}

export async function getHtml(sequenceId: string, sequenceProvider: SequenceProvider, resourceLocation: vscode.Uri) {
    const sequenceInfo = await sequenceProvider.getSequence(sequenceId);
    const links = getScript();
    const css = getCss();
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
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style lang="css">${css}</style>
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
                <script>${links}</script>
            </body>
            </html>`;
}