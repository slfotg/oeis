const vscode = require('vscode');
const axios = require('axios');

const oeis = {
	url: 'https://oeis.org',
	searchUrl: 'https://oeis.org/search',
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

function splitLines(lines) {
	if (typeof lines === 'string') return `<div class="seq"><tt>${lines}</tt></div>`;
	return lines.map(line => `<div class="seq"><tt>${line}</tt></div>`).join('\n');
}

function displaySection(key, label, data) {
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
					div.seq tt {
						text-indent: 3em hanging each-line;
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
			</body>
			</html>`;
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
	const url = `${oeis.url}/${item.label}`;
	var panel = vscode.window.createWebviewPanel('oeis', item.label, vscode.ViewColumn.One, { enableScripts: true });
	const html = getHtml(item.label, context);
	panel.webview.html = html;
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
		const value = editor.document.getText(selection);
		searchOeis(value, context);
	});

	context.subscriptions.push(oeisSearch);
	context.subscriptions.push(oeisSearchSelected);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
