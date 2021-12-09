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
    return {module, charge: ammo};
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
            expect(slot.module.name).toEqual("Experimental SV-2000 Rapid Light Missile Launcher");
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

        it("Allows for empty slots", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("[Empty High Slot]", ""),
                eftSlot("[Empty Med Slot]", ""),
                eftSlot("[Empty Low Slot]", ""),
                eftSlot("[Empty Rig Slot]", ""),
                eftSlot("[Empty Subsystem Slot]", ""),
                eftSlot("[Empty Service Slot]", ""),
            ));

            expect(fit.highSlots[0].filled).toBeFalsy();
            expect(fit.midSlots[0].filled).toBeFalsy();
            expect(fit.lowSlots[0].filled).toBeFalsy();
            expect(fit.rigSlots[0].filled).toBeFalsy();
            expect(fit.subsystemSlots[0].filled).toBeFalsy();
            expect(fit.serviceSlots[0].filled).toBeFalsy();
        });

        it("Allows for empty slots case insensitive", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("[Empty High slot]", ""),
                eftSlot("[Empty Med slot]", ""),
                eftSlot("[Empty Low slot]", ""),
                eftSlot("[Empty Rig slot]", ""),
                eftSlot("[Empty Subsystem slot]", ""),
                eftSlot("[Empty Service slot]", ""),
            ));

            expect(fit.highSlots[0].filled).toBeFalsy();
            expect(fit.midSlots[0].filled).toBeFalsy();
            expect(fit.lowSlots[0].filled).toBeFalsy();
            expect(fit.rigSlots[0].filled).toBeFalsy();
            expect(fit.subsystemSlots[0].filled).toBeFalsy();
            expect(fit.serviceSlots[0].filled).toBeFalsy();
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

        it("pads missing slots", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
            ));

            expect(fit.highSlots).toHaveLength(5);
            expect(fit.midSlots).toHaveLength(5);
            expect(fit.lowSlots).toHaveLength(4);
            expect(fit.rigSlots).toHaveLength(3);
            expect(fit.subsystemSlots).toHaveLength(0);
        });

        it("Ignores items in cargo", () => {
            //Stop parsing as soon as you find a non slottable item, all items after this are cargo

            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("Experimental SV-2000 Rapid Light Missile Launcher", ""),
                eftSlot("Agency 'Hardshell' TB5 Dose II", ""),
                eftSlot("Damage Control II", ""),
            ));
            expect((fit.highSlots[0] as FilledSlot).module.name).toEqual("Experimental SV-2000 Rapid Light Missile Launcher");

            expect(fit.cargo).toHaveLength(2);
            expect(fit.cargo[0].name).toEqual("Agency 'Hardshell' TB5 Dose II");
            expect(fit.cargo[1].name).toEqual("Damage Control II");
        });


        it("Limits module count to ship limits", () => {
            //Stop parsing as soon as you find a non slottable item, all items after this are cargo

            const fit = new FittingParser().parse(eftFit("my fit", "Damavik",
                eftSlot("200mm Steel Plates II", ""),
                eftSlot("200mm Steel Plates II", ""),
                eftSlot("200mm Steel Plates II", ""),
                eftSlot("Warp Scrambler II", ""),
                eftSlot("Warp Scrambler II", ""),
                eftSlot("Warp Scrambler II", ""),
                eftSlot("Warp Scrambler II", ""),
                eftSlot("Small Infectious Scoped Energy Neutralizer", ""),
                eftSlot("Small Infectious Scoped Energy Neutralizer", ""),
                eftSlot("Small Infectious Scoped Energy Neutralizer", ""),
                eftSlot("Small Infectious Scoped Energy Neutralizer", ""),
                eftSlot("Small Trimark Armor Pump II", ""),
                eftSlot("Small Trimark Armor Pump II", ""),
                eftSlot("Small Trimark Armor Pump II", ""),
                eftSlot("Small Trimark Armor Pump II", ""),
            ));
            expect(fit.highSlots).toHaveLength(3);
            expect(fit.midSlots).toHaveLength(3);
            expect(fit.lowSlots).toHaveLength(3);
            expect(fit.rigSlots).toHaveLength(3);
        });

        describe("subsystems", () => {

            it("finds subsystem items", () => {
                const fit = new FittingParser().parse(eftFit("my fit", "Tengu",
                    eftSlot("Compact Multispectrum Energized Membrane", ""),
                    eftSlot("Proteus Defensive - Covert Reconfiguration", "")));

                const slot = fit.subsystemSlots[0] as FilledSlot;
                expect(slot.module.name).toEqual("Proteus Defensive - Covert Reconfiguration");
                expect(slot.module.type).toEqual(45592);

            });

            const t3cs = ["Tengu", "Loki", "Legion", "Proteus"];
            test.each(t3cs)("does not trim down modules for t3c: %s", (shipName) => {
                const fit = new FittingParser().parse(eftFit("my fit", shipName,
                    eftSlot("Heat Sink II", ""),
                    eftSlot("5MN Quad LiF Restrained Microwarpdrive", ""),
                    eftSlot("Small Focused Beam Laser II", ""),
                    eftSlot("Small Energy Locus Coordinator II", ""),
                ));

                expect(fit.highSlots).toHaveLength(1);
                expect(fit.midSlots).toHaveLength(1);
                expect(fit.lowSlots).toHaveLength(1);
                expect(fit.rigSlots).toHaveLength(3);
            });

            it("limits to 4 subsystem items", () => {
                const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                    eftSlot("Proteus Defensive - Covert Reconfiguration", ""),
                    eftSlot("Proteus Defensive - Covert Reconfiguration", ""),
                    eftSlot("Proteus Defensive - Covert Reconfiguration", ""),
                    eftSlot("Proteus Defensive - Covert Reconfiguration", ""),
                    eftSlot("Proteus Defensive - Covert Reconfiguration", ""),
                ));

                expect(fit.subsystemSlots).toHaveLength(4);
            });
        });

        describe("structures", () => {

            it("parses structures with service modules", () => {

                const fit = new FittingParser().parse(eftFit("my fit", "Fortizar",
                    eftSlot("Standup Ballistic Control System II", ""),
                    eftSlot("Standup Cap Battery II", ""),
                    eftSlot("Standup Cloning Center I", ""),
                ));
                expect((fit.lowSlots[0] as FilledSlot).module.name).toEqual("Standup Ballistic Control System II");
                expect((fit.serviceSlots[0] as FilledSlot).module.name).toEqual("Standup Cloning Center I");
            });

            it("includes correct number of service mods", () => {

                const fit = new FittingParser().parse(eftFit("my fit", "Fortizar",
                    eftSlot("Standup Ballistic Control System II", ""),
                    eftSlot("Standup Cap Battery II", ""),
                    eftSlot("Standup Cloning Center I", ""),
                ));
                expect((fit.lowSlots[0] as FilledSlot).module.name).toEqual("Standup Ballistic Control System II");
                expect((fit.serviceSlots[0] as FilledSlot).module.name).toEqual("Standup Cloning Center I");
                expect(fit.serviceSlots).toHaveLength(5);
            });

        })
    });

    describe("charges", () => {

        it("adds valid charges", () => {
            const fit = new FittingParser().parse(eftFit("my fit", "Caracal",
                eftSlot("Experimental SV-2000 Rapid Light Missile Launcher", "Caldari Navy Mjolnir Light Missile")));

            const slot = fit.highSlots[0] as FilledSlot;
            expect(slot.module.name).toEqual("Experimental SV-2000 Rapid Light Missile Launcher");
            expect(slot.module.type).toEqual(8007);
            expect(slot.charged).toBeTruthy();
            expect(slot.charge.name).toEqual("Caldari Navy Mjolnir Light Missile");
            expect(slot.charge.type).toEqual(27387);
        });
    });
});