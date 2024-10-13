import * as vscode from "vscode";

export interface OeisTerminalLink extends vscode.TerminalLink {
    data: string;
}

export { TerminalSearchLinkProvider } from "./TerminalSearchLinkProvider";
export { TerminalSequenceLinkProvider } from "./TerminalSequenceLinkProvider";
