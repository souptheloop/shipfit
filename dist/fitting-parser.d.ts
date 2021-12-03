import { EftFit } from "@/eft-parser";
export declare type Fit = {
    shipType: Item;
    fitName: string;
    highSlots: Slot[];
    midSlots: Slot[];
    lowSlots: Slot[];
    rigSlots: Slot[];
    subsystemSlots: Slot[];
    cargo: CargoItem[];
};
export declare type Slot = EmptySlot | FilledSlot;
export declare type EmptySlot = {
    filled: false;
};
export declare type FilledSlot = {
    filled: true;
    module: Item;
    ammo: Item;
};
export declare type Item = {
    name: string;
    type: number;
};
export declare type CargoItem = {
    name: string;
};
export declare class FittingParser {
    parse(eftFit: EftFit): Fit;
}
