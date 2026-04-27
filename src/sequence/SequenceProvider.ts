import * as vscode from "vscode";
import { Memento } from "vscode";

type stringType = string | string[];

/**
 * Raw response data from the OEIS API.
 *
 * Some fields are omitted for brevity.
 */
interface ResponseInfo {
    number: number;
    name: string;
    data: string;
    offset?: string;
    comment?: stringType;
    references?: stringType;
    link?: stringType;
    formula?: stringType;
    example?: stringType;
    maple?: stringType;
    mathematica?: stringType;
    program?: stringType;
    xref?: stringType;
    keyword?: stringType;
    author?: stringType;
}

/**
 * Extended sequence information with the sequence ID.
 */
export interface SequenceInfo extends ResponseInfo {
    sequenceId: string;
}

/**
 * Converts a response to a sequence info by adding a sequence ID.
 * @param response the raw response from the OEIS API
 * @returns the sequence info with a sequence ID
 */
function fromResponse(response: ResponseInfo): SequenceInfo {
    return {
        ...response,
        sequenceId: "A" + response.number.toString().padStart(6, "0"),
    } as SequenceInfo;
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
class CachedSequenceProvider implements SequenceProvider {
    private cache: Memento = {} as Memento;
    private searchUrl: string = "https://oeis.org/search";
    private userAgentHeader;

    constructor(state: Memento, searchUrl?: string) {
        this.cache = state;
        if (searchUrl) {
            this.searchUrl = searchUrl;
        }
        const ext = vscode.extensions.getExtension("slfotg.oeis");
        const version = ext?.packageJSON?.version ?? "0.0.0";
        this.userAgentHeader = `slfotg.oeis/${version} (slfotg@gmail.com)`;
    }

    async search(text: string): Promise<SequenceInfo[]> {
        try {
            const params = new URLSearchParams({
                q: text,
                fmt: "json",
            });
            const response = await fetch(`${this.searchUrl}?${params}`, {
                method: "GET",
                headers: {
                    "User-Agent": this.userAgentHeader,
                },
            });
            if (!response.ok) {
                throw new Error(
                    `OEIS API error: ${response.status} ${response.statusText}`,
                );
            }
            const info = await response.json();
            if (info && Array.isArray(info)) {
                const data: SequenceInfo[] = info.map(fromResponse);
                for (const seq of data) {
                    this.cache.update(seq.sequenceId, { ...seq });
                }
                return data;
            } else {
                return [];
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`OEIS search error: ${message}`);
            return [];
        }
    }

    async getSequence(sequenceId: string): Promise<SequenceInfo> {
        if (!this.cache.get(sequenceId)) {
            await this.search(`id:${sequenceId}`);
        }
        if (this.cache.get(sequenceId)) {
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
export function getSequenceProvider(state: Memento): SequenceProvider {
    return new CachedSequenceProvider(state);
}
