import "@testing-library/jest-dom";
import {EftParser, EftFit} from "./eft-parser";


describe("EFT Parser", () => {
    describe("metadata", () => {

        it("parses ship type", () => {
            const fit = new EftParser().parse("[Caracal,my caracal]");

            expect(fit.shipType).toEqual("Caracal")
        });

        it("parses ship type with extra space", () => {
            const fit = new EftParser().parse("[ Caracal ,my caracal]");

            expect(fit.shipType).toEqual("Caracal")
        });

        it("parses fit name", () => {
            const fit = new EftParser().parse("[Caracal,my caracal]");

            expect(fit.fitName).toEqual("my caracal")
        });

        it("parses fit name with extra space", () => {
            const fit = new EftParser().parse("[Caracal, my caracal ]");

            expect(fit.fitName).toEqual("my caracal")
        });
    });

    describe("racks", () => {
        it("parses lines to slots", () => {
            const fit = new EftParser().parse(`[Caracal, my caracal ]
            my unloaded gun
            my loaded gun,some ammo
            `);

            expect(fit.slots[0].module).toEqual("my unloaded gun");
            expect(fit.slots[0].ammo).toBeUndefined();

            expect(fit.slots[1].module).toEqual("my loaded gun");
            expect(fit.slots[1].ammo).toEqual("some ammo")
        });

        it("parses lines to slots when extra spaces", () => {
            const fit = new EftParser().parse(`[Caracal, my caracal ]
             my unloaded gun 
             my loaded gun , some ammo 
            `);

            expect(fit.slots[0].module).toEqual("my unloaded gun");
            expect(fit.slots[0].ammo).toBeUndefined();

            expect(fit.slots[1].module).toEqual("my loaded gun");
            expect(fit.slots[1].ammo).toEqual("some ammo")
        });


    });
});
