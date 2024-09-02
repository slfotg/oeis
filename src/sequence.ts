
import * as vscode from 'vscode';
import axios from 'axios';
import * as path from 'path';

type stringType = (string | string[]);

/**
 * Raw response data from the OEIS API.
 * 
 * Some fields are omitted for brevity.
 */
export interface ResponseInfo {
    number: number,
    name: string,
    data: string,
    offset?: string,
    comment?: stringType,
    references?: stringType,
    link?: stringType,
    formula?: stringType,
    example?: stringType,
    maple?: stringType,
    mathematica?: stringType,
    program?: stringType,
    xref?: stringType,
    keyword?: stringType,
    author?: stringType,
}

/**
 * Extended sequence information with the sequence ID.
 */
export interface SequenceInfo extends ResponseInfo {
    sequenceId: string
}

export class SequenceInfoTreeItem extends vscode.TreeItem {
    public sequenceInfo: SequenceInfo;
    command?: vscode.Command = {
        command: "oeis.showSequence",
        title: "Show Sequence",
        arguments: [this.label]
    }
    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'number.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'number.svg')
    };
    constructor(sequenceInfo: SequenceInfo) {
        super(sequenceInfo.sequenceId, vscode.TreeItemCollapsibleState.None);
        this.sequenceInfo = sequenceInfo;
        this.label = sequenceInfo.sequenceId;
        this.description = sequenceInfo.name;
        this.tooltip = sequenceInfo.data;
    }
}

/**
 * Converts a response to a sequence info by adding a sequence ID.
 * @param response the raw response from the OEIS API
 * @returns the sequence info with a sequence ID
 */
function fromResponse(response: ResponseInfo): SequenceInfo {
    return { ...response, sequenceId: "A" + response.number.toString().padStart(6, '0') } as SequenceInfo;
}

/**
 * Interface to retrieve OEIS sequences from the OEIS API.
 */
export interface SequenceProvider {
    /**
     * Searches for sequences by query text.
     * @param text the text to search for
     * @returns a list of sequence information
     */
    search(text: string): Promise<SequenceInfo[]>;

    /**
     * Gets a sequence by its sequence ID.
     * @param sequenceId the sequence ID to retrieve
     */
    getSequence(sequenceId: string): Promise<SequenceInfo>;
}


/**
 * A sequence provider that caches the results of previous searches.
 */
export class CachedSequenceProvider implements SequenceProvider, vscode.TreeDataProvider<SequenceInfoTreeItem> {

    private cache: Map<string, SequenceInfo> = new Map<string, SequenceInfo>();

    private _onDidChangeTreeData: vscode.EventEmitter<SequenceInfoTreeItem | undefined> = new vscode.EventEmitter<SequenceInfoTreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<SequenceInfoTreeItem | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: SequenceInfoTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: SequenceInfoTreeItem | undefined): vscode.ProviderResult<SequenceInfoTreeItem[]> {
        if (element === undefined) {
            return Array.from(this.cache.values()).map(info => new SequenceInfoTreeItem(info));
        }
        return [];
    }

    public deleteItem(item: SequenceInfoTreeItem) {
        console.log("deleteItem called");
        this.cache.delete(item.sequenceInfo.sequenceId);
        this._onDidChangeTreeData.fire(undefined);
    }

    async search(text: string): Promise<SequenceInfo[]> {
        console.log(`Searching for ${text}`);
        const info = await axios.get("https://oeis.org/search", { params: { q: text, fmt: "json" } });
        const results = info.data.results as ResponseInfo[];
        const data: SequenceInfo[] = results.map(fromResponse);
        for (const seq of data) {
            this.cache.set(seq.sequenceId, { ...seq });
        }
        this._onDidChangeTreeData.fire(undefined);
        return data;
    }

    async getSequence(sequenceId: string): Promise<SequenceInfo> {
        if (!this.cache.has(sequenceId)) {
            await this.search(`id:${sequenceId}`);
        }
        if (this.cache.has(sequenceId)) {
            return this.cache.get(sequenceId) as SequenceInfo;
        } else {
            throw Error(`Sequence ${sequenceId} not found`);
        }
    }
}

/**
 * Gets the default sequence provider.
 * @returns a new sequence provider
 */
export function getSequenceProvider(): CachedSequenceProvider {
    return new CachedSequenceProvider();
}