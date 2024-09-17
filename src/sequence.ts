import axios from "axios";
import { Memento } from "vscode";

type stringType = string | string[];

/**
 * Raw response data from the OEIS API.
 *
 * Some fields are omitted for brevity.
 */
export interface ResponseInfo {
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

    constructor(state: Memento, searchUrl?: string) {
        this.cache = state;
        if (searchUrl) {
            this.searchUrl = searchUrl;
        }
    }

    async search(text: string): Promise<SequenceInfo[]> {
        const info = await axios.get(this.searchUrl, {
            params: { q: text, fmt: "json" },
        });
        const results = info.data.results as ResponseInfo[];
        const data: SequenceInfo[] = results.map(fromResponse);
        for (const seq of data) {
            this.cache.update(seq.sequenceId, { ...seq });
        }
        return data;
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
