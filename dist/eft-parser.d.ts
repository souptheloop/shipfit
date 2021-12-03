export declare type EftFit = {
    shipType: string;
    fitName: string;
    slots: EftSlot[];
};
export declare type EftSlot = {
    module: string;
    ammo: string;
};
/**
 * This parser does a simple parse from text to a js object, separating out the title/name
 * and getting each line (splitting into module/ammo where appropriate). It does not attempt to
 * work out which slot is which or validate that the fit is valid
 */
export declare class EftParser {
    parseTitle(title: string): string[];
    parseLine(line: string): EftSlot;
    parse(fit: string): EftFit;
}
