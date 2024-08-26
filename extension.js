const vscode = require('vscode');
const axios = require('axios');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const disposable = vscode.commands.registerCommand('oeis.search', function () {

		vscode.window.showInputBox({
			placeHolder: "1,1,2,3,5,8",
		}).then(value => {

			axios.get('https://oeis.org/search', { params: { q: value, fmt: 'json' } })
				.then(response => {

					const results = response.data.results.map(({ number, data, name }) => {
						const seqId = "A" + number.toString().padStart(6, '0');
						return {
							label: seqId,
							description: name,
							detail: `[${data}]`,
						}
					});

					vscode.window.showQuickPick(results, {
						title: `Search results ${value}`,
					}).then(item => {
						if (!item) return;
						const url = `https://oeis.org/${item.label}`;
						vscode.env.openExternal(vscode.Uri.parse(url));
					});
				})
				.catch(error => {
					console.error(error);
				});
		});
	});

	context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
