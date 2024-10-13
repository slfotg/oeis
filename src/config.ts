export enum Command {
    Search = "oeis.search",
    SearchSelectedText = "oeis.searchSelectedText",
    ShowSequence = "oeis.showSequence",
    ToggleCodeLens = "oeis.toggleCodeLens",
}

export enum ViewType {
    SequencePage = "oeisSequence",
    SearchPanel = "oeisSearchPanel",
}

export const url = "https://oeis.org";
export const searchUrl = "https://oeis.org/search";
export const wikiURL = "https://oeis.org/wiki";

export type SectionType =
    | "offset"
    | "comment"
    | "reference"
    | "link"
    | "formula"
    | "example"
    | "maple"
    | "mathematica"
    | "program"
    | "xref"
    | "keyword"
    | "author";

export type SectionMap = Record<SectionType, string>;
export const sections: SectionMap = {
    offset: "Offset",
    comment: "Comments",
    reference: "References",
    link: "Links",
    formula: "Formula",
    example: "Example",
    maple: "Maple",
    mathematica: "Mathematica",
    program: "Prog",
    xref: "Crossrefs",
    keyword: "Keywords",
    author: "Author",
};
