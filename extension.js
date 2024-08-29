const vscode = require('vscode');
const axios = require('axios');

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
}

function splitData(data) {
    return data.split(',').join(', ');
}

function addLinks(line) {
    // TODO - This code is buggy right now... A###### found in existing links causes problems
    return line
        .replaceAll(/ (A\d{6})/g, ` <a href="#$1" class="seq-link">$1</a>`)
        .replaceAll(/ _([a-zA-Z\. ]+)_/g, ` <a href="${oeis.wikiURL}/User:$1">$1</a>`)
}

function splitLines(lines) {
    if (typeof lines === 'string') return `<div class="seq"><tt>${addLinks(lines)}</tt></div>`;
    return lines.map(line => `<div class="seq"><tt>${addLinks(line)}</tt></div>`).join('\n');
}

function displaySection(key, label, data) {
    if (!data) return '';
    const lines = data[key];
    if (!lines) return '';
    return `<br />
			<div class="section">
				<div class="label">
					<tt>${label}</tt>
				</div>
				<div class="description">
					<tt>${splitLines(lines)}</tt>
				</div>
			</div>`
}

/**
 * @param {vscode.ExtensionContext} context
 */
function getHtml(label, context) {
    const response = context.workspaceState.get(label);
    if (!response) return 'Sequence not found';
    const sections = oeis.sections.map(([key, label]) => displaySection(key, label, response)).join('\n');
    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<style lang="css">
					body {
						padding-left: 30px;
					}
					hr {
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
					}
				</style>
				<title>${label}</title>
			</head>
			<body>
				<div class="content">
					<h2><tt><a href="${oeis.url}/${label}">${label}</a> - ${response.name}</tt></h2>
					<hr />
					<div class="data">
						<tt>${splitData(response.data)}</tt></td>
					</div>
					<hr />
					${sections}
				</div>
				<script>
				(function() {
					const vscode = acquireVsCodeApi();
					const links = document.getElementsByClassName("seq-link");

					for (let i = 0; i < links.length; i += 1) {
						links[i].addEventListener("click", function(e) {
							e.preventDefault();
							vscode.postMessage(this.text);
						});
					}
				}());
				</script>
			</body>
			</html>`;
}

async function showSequence(sequenceId, context) {
    const url = `${oeis.url}/${sequenceId}`;
    let panel = vscode.window.createWebviewPanel('oeis', sequenceId, vscode.ViewColumn.One, { enableScripts: true });
    const html = getHtml(sequenceId, context);
    panel.webview.html = html;
    panel.webview.onDidReceiveMessage(
        message => {
            showSequence(message, context);
        },
        undefined,
        context.subscriptions
    );
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function showResults(results, value, context) {
    const item = await vscode.window.showQuickPick(results, {
        title: `Search results ${value}`,
        ignoreFocusOut: true,
        matchOnDescription: true,
        matchOnDetail: true,
    });
    if (!item) return;
    showSequence(item.label, context);
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function searchOeis(value, context) {
    const response = await axios.get(oeis.searchUrl, { params: { q: value, fmt: 'json' } });

    const results = response.data.results.map(({ number, data, name }) => {
        const seqId = "A" + number.toString().padStart(6, '0');
        return {
            label: seqId,
            description: name,
            detail: `[${data}]`,
        }
    });

    for (const result of response.data.results) {
        const seqId = "A" + result.number.toString().padStart(6, '0');
        context.workspaceState.update(seqId, result);
    }

    showResults(results, value, context);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const oeisSearch = vscode.commands.registerCommand('oeis.search', function () {
        vscode.window.showInputBox({
            placeHolder: "1,1,2,3,5,8",
        }).then(value => {
            searchOeis(value, context);
        });
    });

    const oeisSearchSelected = vscode.commands.registerCommand('oeis.searchSelected', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const selection = editor.selection;
        if (!selection) return;
        const value = editor.document.getText(selection);
        searchOeis(value, context);
    });

    const linkProvider = vscode.window.registerTerminalLinkProvider({
        provideTerminalLinks: (context, token) => {
            // matches:
            // "1,2,3,4"
            // "1, 2, 3, 4"
            // "[1,2,3,4]"
            // "[1, 2, 3, 4]"
            // 1, 2, 3...
            const matchesSequence = /\[?(\d+, ?)+ ?\d+\]?/g;
            const matches = [...context.line.matchAll(matchesSequence)];

            if (!matches) return [];
            if (matches.length === 0) {
                return [];
            }

            const links = matches.map(m => {
                return {
                    length: m[0].length,
                    startIndex: m.index,
                    tooltip: 'Search Sequence',
                    data: m[0],
                };
            });
            return links;
        },
        handleTerminalLink: (link) => {
            searchOeis(link.data, context);
        }
    });
    console.log("registering subscriptions");
    context.subscriptions.push(
        oeisSearch,
        oeisSearchSelected,
        linkProvider
    );
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
