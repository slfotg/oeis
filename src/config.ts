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

export type Keyword =
    | "base"
    | "bref"
    | "changed"
    | "cofr"
    | "cons"
    | "core"
    | "dead"
    | "dumb"
    | "dupe"
    | "easy"
    | "eigen"
    | "fini"
    | "frac"
    | "full"
    | "hard"
    | "hear"
    | "less"
    | "look"
    | "more"
    | "mult"
    | "new"
    | "nice"
    | "nonn"
    | "obsc"
    | "probation"
    | "sign"
    | "tabf"
    | "tabl"
    | "uned"
    | "unkn"
    | "walk"
    | "word";

export type KeywordDescriptions = Record<Keyword, string>;
export const keywordDescriptions: KeywordDescriptions = {
    base: `Sequence is dependent on base used`,
    bref: `Sequence is too short to do any analysis with`,
    changed: `A sequence that was changed in the last two or three weeks (this keyword is set automatically)`,
    cofr: `A continued fraction expansion of a number`,
    cons: `A decimal expansion of a number`,
    core: `An important sequence`,
    dead: `An erroneous or duplicated sequence (the table contains a number of incorrect sequences that have appeared in the literature, with pointers to the correct versions)`,
    dumb: `An unimportant sequence`,
    dupe: `Duplicate of another sequence`,
    easy: `It is easy to produce terms of this sequence`,
    eigen: `An eigensequence: a fixed sequence for some transformation - see the files transforms and transforms (2) for further information.`,
    fini: `A finite sequence`,
    frac: `Numerators or denominators of sequence of rational numbers`,
    full: `The full sequence is given, either in the DATA section or in the b-file (implies the sequence is finite and has keyword "fini")`,
    hard: `Next term is not known and may be hard to find. Would someone please extend this sequence?`,
    hear: `A sequence worth listening to.`,
    less: `This is a less interesting sequence and is less likely to be the one you were looking for.`,
    look: `A sequence with an interesting graph.`,
    more: `More terms are needed! Would someone please extend this sequence? We need enough terms to fill about three lines on the screen.`,
    mult: `Multiplicative: a(mn)=a(m)a(n) if g.c.d.(m,n)=1`,
    new: `New (added or modified within last two weeks, roughly; this keyword is set automatically)`,
    nice: `An exceptionally nice sequence`,
    nonn: `A sequence of nonnegative numbers (more precisely, all the displayed terms are nonnegative; it is not excluded that later terms in the sequence become negative)`,
    obsc: `Obscure, better description needed`,
    probation: `Included on a provisional basis, but may be deleted later at the discretion of the editor.`,
    sign: `Sequence contains negative numbers`,
    tabf: `An irregular or funny-shaped triangle of numbers (one in which the n-th row does not contain n terms) made into a sequence by reading it by rows; or a table with a fixed number of columns that are read by rows — a list of pairs, triples, quadruples, etc. Any 2- or 3-D sequence that does not warrant the keyword "tabl". See A028297 and A027113 for examples.`,
    tabl: `A regular triangle of numbers (one in which the n-th row contains n terms) made into a sequence by reading it by rows; or an infinite square array T(n,k), n >= 0, k >= 0, say, made into a sequence by reading it by antidiagonals either upwards or downwards. See A007318 and A003987 for examples.`,
    uned: `Not edited. The keyword "uned" indicates that this sequence needs editing. If you can help by editing the entry, please do so!`,
    unkn: `Little is known; an unsolved problem; anyone who can find a formula or recurrence is urged to add it to the entry.`,
    walk: `Counts walks (or self-avoiding paths)`,
    word: `Depends on words for the sequence in some language`,
};
