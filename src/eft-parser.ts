
export type EftFit = {
    shipType: string;
    fitName: string;
    slots: EftSlot[]
}

export type EftSlot = {
    module: string,
    charge: string
}

/**
 * This parser does a simple parse from text to a js object, separating out the title/name
 * and getting each line (splitting into module/ammo where appropriate). It does not attempt to
 * work out which slot is which or validate that the fit is valid
 */
export class EftParser {

    parseTitle(title: string): string[] {
        const trimmedTitle = title.substr(1, title.length -2);
        const [shipType, shipName] = trimmedTitle.split(",");

        return [shipType.trim(), shipName.trim()]
    }

    parseLine(line: string): EftSlot {
        const [module, charge] = line.split(",");

        return {module: module.trim(), charge: charge?.trim()}
    }

    parse(fit: string): EftFit {
        const parsedFit: EftFit = {
            shipType: "",
            fitName: "",
            slots: [],
        };

        const lines = fit
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line !== "");

        const first = lines.slice(0, 1)[0];
        const remainder = lines.slice(1, lines.length);

        const [shipType, fitName] = this.parseTitle(first);
        parsedFit.fitName = fitName;
        parsedFit.shipType = shipType;

        parsedFit.slots = remainder.map(this.parseLine);

        return parsedFit;
    }
}
