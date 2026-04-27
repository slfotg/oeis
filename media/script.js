/* eslint-disable no-undef */
(function () {
    const vscode = acquireVsCodeApi();
    const links = document.querySelectorAll(".seq-link");

    links.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            if (this.textContent?.match(/^A\d{6}$/)) {
                vscode.postMessage(this.textContent);
            }
        });
    });
})();
