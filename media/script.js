/* eslint-disable no-undef */
(function () {
    const vscode = acquireVsCodeApi();
    const links = document.getElementsByClassName("seq-link");

    for (let i = 0; i < links.length; i += 1) {
        links[i].addEventListener("click", function (e) {
            e.preventDefault();
            vscode.postMessage(this.text);
        });
    }
}());