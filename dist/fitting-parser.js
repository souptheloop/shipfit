import { Ships } from "./data/ships";
import { Modules } from "./data/modules";
function item(name, type) {
    return { name, type };
}
/**
 * This parser takes the result of the EftParser and returns an actual fit
 * with different high/mid/lows, drones, cargo etc.
 */
var Slots;
(function (Slots) {
    Slots[Slots["LowSlot"] = 11] = "LowSlot";
    Slots[Slots["HighSlot"] = 12] = "HighSlot";
    Slots[Slots["MidSlot"] = 13] = "MidSlot";
    Slots[Slots["RigSlot"] = 2663] = "RigSlot";
    Slots[Slots["SubsystemSlot"] = 3772] = "SubsystemSlot";
})(Slots || (Slots = {}));
export class FittingParser {
    parse(eftFit) {
        const ship = Ships.find((ship) => ship.typeName === eftFit.shipType);
        if (!ship) {
            throw `Ship with name "${eftFit.shipType}" not found`;
        }
        const fit = {
            fitName: eftFit.fitName,
            shipType: item(ship.typeName, ship.typeID),
            highSlots: [],
            midSlots: [],
            lowSlots: [],
            rigSlots: [],
            subsystemSlots: [],
            cargo: []
        };
        let cargo = false;
        eftFit.slots.forEach((eftSlot) => {
            switch (eftSlot.module) {
                case "[Empty High Slot]":
                    fit.highSlots.push({ filled: false });
                    return;
                case "[Empty Med Slot]":
                    fit.midSlots.push({ filled: false });
                    return;
                case "[Empty Low Slot]":
                    fit.lowSlots.push({ filled: false });
                    return;
                case "[Empty Rig Slot]":
                    fit.rigSlots.push({ filled: false });
                    return;
                case "[Empty Subsystem Slot]":
                    fit.subsystemSlots.push({ filled: false });
                    return;
            }
            if (cargo) {
                fit.cargo.push({ name: eftSlot.module });
                return;
            }
            const module = Modules.find((module) => module.typeName === eftSlot.module);
            if (!module) {
                // Presume it's a cargo item for now and that all future items are also cargo
                cargo = true;
                fit.cargo.push({ name: eftSlot.module });
                return;
            }
            const slot = {
                filled: true,
                module: { name: module.typeName, type: module.typeID },
                ammo: { name: "", type: -1 }
            };
            switch (module.effectID) {
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
                default: throw 'Unexpected error, no rack found for module';
            }
        });
        return fit;
    }
}
//# sourceMappingURL=fitting-parser.js.map