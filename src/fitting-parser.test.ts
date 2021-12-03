import "@testing-library/jest-dom";
import {EftFit, EftSlot} from "./eft-parser";
import {FilledSlot, FittingParser} from "./fitting-parser";

function eftFit(fitName: string, shipType: string, ...slots: EftSlot[]): EftFit {
    return {
        shipType,
        fitName,
        slots
    } as EftFit
}

function eftSlot(module: string, ammo: string): EftSlot {
    return {module, ammo};
}

describe("Fitting Parser", () => {
    describe("metadata", () => {

        it("parses fit name", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal"));

            expect(fit.fitName).toEqual("my fit")
        });


        it("parses ship type", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal"));

            expect(fit.shipType.name).toEqual("Caracal");
            expect(fit.shipType.type).toEqual(621);
        });

        it("throws error when ship not found", () => {

            expect(() =>
                new FittingParser().parse(eftFit("my fit", "FakeShip"))
            ).toThrowError(`Ship with name "FakeShip" not found`);
        });
    });

    describe("racks", () => {

        it("finds highslot items", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("Experimental SV-2000 Rapid Light Missile Launcher", "")));

            const slot = fit.highSlots[0] as FilledSlot;
            expect(slot.module.name).toEqual("Experimental SV-2000 Rapid Light Missile Launcher")
            expect(slot.module.type).toEqual(8007)
        });

        it("finds midslot items", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("Small Shield Extender II", "")));

            const slot = fit.midSlots[0] as FilledSlot;
            expect(slot.module.name).toEqual("Small Shield Extender II");
            expect(slot.module.type).toEqual(380)
        });

        it("finds lowslot items", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("Damage Control II", "")));

            const slot = fit.lowSlots[0] as FilledSlot;
            expect(slot.module.name).toEqual("Damage Control II");
            expect(slot.module.type).toEqual(2048)
        });

        it("finds rig items", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("Small Hyperspatial Velocity Optimizer I", "")));

            const slot = fit.rigSlots[0] as FilledSlot;
            expect(slot.module.name).toEqual("Small Hyperspatial Velocity Optimizer I");
            expect(slot.module.type).toEqual(31159)
        });

        it("finds subsystem items", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("Proteus Defensive - Covert Reconfiguration", "")));

            const slot = fit.subsystemSlots[0] as FilledSlot;
            expect(slot.module.name).toEqual("Proteus Defensive - Covert Reconfiguration");
            expect(slot.module.type).toEqual(45592)
        });

        it("Allows for empty slots", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("[Empty High Slot]", ""),
                eftSlot("[Empty Med Slot]", ""),
                eftSlot("[Empty Low Slot]", ""),
                eftSlot("[Empty Rig Slot]", ""),
                eftSlot("[Empty Subsystem Slot]", ""),
            ));

            expect(fit.highSlots[0].filled).toBeFalsy();
            expect(fit.midSlots[0].filled).toBeFalsy();
            expect(fit.lowSlots[0].filled).toBeFalsy();
            expect(fit.rigSlots[0].filled).toBeFalsy();
            expect(fit.subsystemSlots[0].filled).toBeFalsy();
        });

        it("Allows for empty slots case insensitive", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("[Empty High slot]", ""),
                eftSlot("[Empty Med slot]", ""),
                eftSlot("[Empty Low slot]", ""),
                eftSlot("[Empty Rig slot]", ""),
                eftSlot("[Empty Subsystem slot]", ""),
            ));

            expect(fit.highSlots[0].filled).toBeFalsy();
            expect(fit.midSlots[0].filled).toBeFalsy();
            expect(fit.lowSlots[0].filled).toBeFalsy();
            expect(fit.rigSlots[0].filled).toBeFalsy();
            expect(fit.subsystemSlots[0].filled).toBeFalsy();
        });

        it("Allows slots to be listed in any order", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("Proteus Defensive - Covert Reconfiguration", ""),
                eftSlot("Small Shield Extender II", ""),
                eftSlot("Experimental SV-2000 Rapid Light Missile Launcher", ""),
                eftSlot("Damage Control II", ""),
            ));

            expect((fit.subsystemSlots[0] as FilledSlot).module.name)
                .toEqual("Proteus Defensive - Covert Reconfiguration");
            expect((fit.midSlots[0] as FilledSlot).module.name)
                .toEqual("Small Shield Extender II");
            expect((fit.highSlots[0] as FilledSlot).module.name)
                .toEqual("Experimental SV-2000 Rapid Light Missile Launcher");
            expect((fit.lowSlots[0] as FilledSlot).module.name)
                .toEqual("Damage Control II");
        });

        it("Ignores items in cargo", () => {
            //Stop parsing as soon as you find a non slottable item, all items after this are cargo

            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("Experimental SV-2000 Rapid Light Missile Launcher", ""),
                eftSlot("Agency 'Hardshell' TB5 Dose II", ""),
                eftSlot("Damage Control II", ""),
            ));
            expect((fit.highSlots[0] as FilledSlot).module.name).toEqual("Experimental SV-2000 Rapid Light Missile Launcher");
            expect(fit.lowSlots).toHaveLength(0);

            expect(fit.cargo).toHaveLength(2);
            expect(fit.cargo[0].name).toEqual("Agency 'Hardshell' TB5 Dose II");
            expect(fit.cargo[1].name).toEqual("Damage Control II");
        });

        // it("Loads ammo/charge info", () => {
        //     // Could do this in v2
        //     expect(true).toBeFalsy();
        // });

    });
});