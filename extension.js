const vscode = require('vscode');
const axios = require('axios');

const oeis = {
	url: 'https://oeis.org',
	searchUrl: 'https://oeis.org/search',
}

async function showResults(results, value) {
	const item = await vscode.window.showQuickPick(results, {
		title: `Search results ${value}`,
		ignoreFocusOut: true,
		matchOnDescription: true,
		matchOnDetail: true,
	});
	if (!item) return;
	const url = `${oeis.url}/${item.label}`;
	vscode.env.openExternal(vscode.Uri.parse(url));
}

async function searchOeis(value) {
	console.log(value);
	const response = await axios.get(oeis.searchUrl, { params: { q: value, fmt: 'json' } });
	console.log(response);

	const results = response.data.results.map(({ number, data, name }) => {
		const seqId = "A" + number.toString().padStart(6, '0');
		return {
			label: seqId,
			description: name,
			detail: `[${data}]`,
		}
	});
	console.log(results);

	showResults(results, value);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const oeisSearch = vscode.commands.registerCommand('oeis.search', function () {
		vscode.window.showInputBox({
			placeHolder: "1,1,2,3,5,8",
		}).then(value => {
			searchOeis(value);
		});
	});

	const oeisSearchSelected = vscode.commands.registerCommand('oeis.searchSelected', function () {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const selection = editor.selection;
		const value = editor.document.getText(selection);
		searchOeis(value);
	});

	context.subscriptions.push(oeisSearch);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
