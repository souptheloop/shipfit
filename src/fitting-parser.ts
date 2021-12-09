import {EftFit} from "@/eft-parser";
import {Ships} from "../data/ships";
import {Modules} from "../data/modules";

export type Fit = {
    shipType: Item;
    fitName: string;
    highSlots: Slot[]
    midSlots: Slot[]
    lowSlots: Slot[]
    rigSlots: Slot[]
    subsystemSlots: Slot[]
    serviceSlots: Slot[]
    cargo: CargoItem[]
}

export type Slot = EmptySlot | FilledSlot

export type EmptySlot = {
    filled: false
}

export type FilledSlot = {
    filled: true
    module: Item,
    ammo: Item
}

export type Item = {
    name: string,
    type: number
}

export type CargoItem = {
    name: string,
}

function item(name: string, type: number): Item {
    return {name, type};
}

const t3cs = ["Proteus", "Legion", "Tengu", "Loki"];

/**
 * This parser takes the result of the EftParser and returns an actual fit
 * with different high/mid/lows, drones, cargo etc.
 */
enum Slots {
    LowSlot = 11,
    HighSlot = 12,
    MidSlot = 13,
    RigSlot = 2663,
    SubsystemSlot = 3772,
    ServiceSlot = 6306,
}

export class FittingParser {

    parse(eftFit: EftFit): Fit {

        const ship = Ships.find((ship) => ship.typeName === eftFit.shipType);
        if (!ship) {
            throw `Ship with name "${eftFit.shipType}" not found`;
        }

        const fit: Fit = {
            fitName: eftFit.fitName,
            shipType: item(ship.typeName, ship.typeID),
            highSlots: [],
            midSlots: [],
            lowSlots: [],
            rigSlots: [],
            subsystemSlots: [],
            serviceSlots: [],
            cargo: []
        };

        let cargo = false;
        eftFit.slots.forEach((eftSlot) => {
            switch(eftSlot.module.toLowerCase()) {
                case "[empty high slot]": fit.highSlots.push({filled: false}); return;
                case "[empty med slot]": fit.midSlots.push({filled: false}); return;
                case "[empty low slot]": fit.lowSlots.push({filled: false}); return;
                case "[empty rig slot]": fit.rigSlots.push({filled: false}); return;
                case "[empty subsystem slot]": fit.subsystemSlots.push({filled: false}); return;
                case "[empty service slot]": fit.serviceSlots.push({filled: false}); return;
            }

            if(cargo) {
                fit.cargo.push({name: eftSlot.module});
                return;
            }

            const module = Modules.find((module) => module.typeName === eftSlot.module);
            if (!module) {
                // Presume it's a cargo item for now and that all future items are also cargo
                cargo = true;
                fit.cargo.push({name: eftSlot.module});
                return;
            }

            const slot = {
                filled: true,
                module: {name: module.typeName, type: module.typeID},
                ammo: {name: "", type: -1}
            } as FilledSlot;

            switch(module.effectID as Slots) {
                case Slots.HighSlot:
                    fit.highSlots.push(slot);
                    break;
                case Slots.MidSlot:
                    fit.midSlots.push(slot);
                    break;
                case Slots.LowSlot:
                    fit.lowSlots.push(slot);
                    break;
                case Slots.RigSlot:
                    fit.rigSlots.push(slot);
                    break;
                case Slots.SubsystemSlot:
                    fit.subsystemSlots.push(slot);
                    break;
                case Slots.ServiceSlot:
                    fit.serviceSlots.push(slot);
                    break;
                default:
                    throw 'Unexpected error, no rack found for module'
            }
        });

        if (!t3cs.includes(ship.typeName)) {
            fit.highSlots = fit.highSlots.slice(0, ship.highs);
            fit.midSlots = fit.midSlots.slice(0, ship.mids);
            fit.lowSlots = fit.lowSlots.slice(0, ship.lows);
            fit.subsystemSlots = fit.subsystemSlots.slice(0, 4);
        }

        fit.rigSlots = fit.rigSlots.slice(0, ship.rigs);
        while (fit.serviceSlots.length < ship.services) {
            fit.serviceSlots.push({filled: false})
        }
        while (fit.highSlots.length < ship.highs) {
            fit.highSlots.push({filled: false})
        }
        while (fit.midSlots.length < ship.mids) {
            fit.midSlots.push({filled: false})
        }
        while (fit.lowSlots.length < ship.lows) {
            fit.lowSlots.push({filled: false})
        }
        while (fit.rigSlots.length < ship.rigs) {
            fit.rigSlots.push({filled: false})
        }

        return fit;
    }
}
