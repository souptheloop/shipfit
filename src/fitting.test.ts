import "@testing-library/jest-dom";
import {fireEvent} from "@testing-library/dom";
import './fitting';


describe("Fitting Component", () => {

    describe("Fitting wheel", () => {
        it("renders empty fit", () => {
            const [component, shadowRoot] = render(`<ship-fit></ship-fit>`);

            expect(shadowRoot.textContent).toEqual("Error - No fit provided")
        });

        describe("modules", () => {
            it("renders module with image and slot", () => {
                const [component, shadowRoot] = render(`<ship-fit>
[Imperial Navy Slicer, slicer]

Small Focused Beam Laser II
</ship-fit>`);

                expect(shadowRoot.querySelectorAll(".module"))
                    .toHaveLength(1);

                const lazerModule = shadowRoot.querySelectorAll(".module").item(0);
                const lazerSlot = shadowRoot.querySelectorAll(".slot").item(0);
                expect(lazerSlot).toHaveAttribute("href", "#fitting-box");
                expect(lazerModule)
                    .toHaveAttribute("href", "https://images.evetech.net/types/3033/icon?size=64");
                expect(lazerModule.querySelector("image title"))
                    .toHaveTextContent("Small Focused Beam Laser II");

            });

            it("renders empty slot without image", () => {
                const [component, shadowRoot] = render(`<ship-fit>
[Imperial Navy Slicer, slicer]

[Empty High Slot]
</ship-fit>`);

                expect(shadowRoot.querySelectorAll(".module"))
                    .toHaveLength(0);
                expect(shadowRoot.querySelectorAll(".slot"))
                    .toHaveLength(13);
            });

            it("renders all expected slots across racks", () => {
                const [component, shadowRoot] = render(`<ship-fit>
[Imperial Navy Slicer, slicer]

Heat Sink II
Compact Multispectrum Energized Membrane
[Empty Low slot]
Nanofiber Internal Structure II
Small Ancillary Armor Repairer

5MN Quad LiF Restrained Microwarpdrive
[Empty Med slot]

Small Focused Beam Laser II
[Empty High slot]
Small Focused Beam Laser II

[Empty Rig slot]
Small Energy Locus Coordinator II
[Empty Rig slot]
</ship-fit>`);

                expect(shadowRoot.querySelectorAll(`use[href="#fitting-box"]`))
                    .toHaveLength(13);

                const moduleImages = [...shadowRoot.querySelectorAll(`.module title`)]
                    .map((node) => node.textContent);

                expect(moduleImages)
                    .toEqual([
                        "Small Focused Beam Laser II",
                        "Small Focused Beam Laser II",
                        "5MN Quad LiF Restrained Microwarpdrive",
                        "Small Ancillary Armor Repairer",
                        "Nanofiber Internal Structure II",
                        "Compact Multispectrum Energized Membrane",
                        "Heat Sink II",
                        "Small Energy Locus Coordinator II"
                    ]);
            });
        });

        describe("subsystems", () => {
            it("renders subsystems", () => {
                const [component, shadowRoot] = render(`<ship-fit>
            [Proteus, Proteus]
            Proteus Core - Augmented Fusion Reactor
            Proteus Defensive - Covert Reconfiguration
</ship-fit>`);

                expect(shadowRoot.querySelectorAll(`use[href="#fitting-box"].slot`))
                    .toHaveLength(5);

                const moduleImages = [...shadowRoot.querySelectorAll(`.module title`)]
                    .map((node) => node.textContent);

                expect(moduleImages)
                    .toEqual([
                        "Proteus Defensive - Covert Reconfiguration",
                        "Proteus Core - Augmented Fusion Reactor"
                    ]);
            });

        });

        describe("services", () => {
            it("renders services", () => {
                const [component, shadowRoot] = render(`<ship-fit>
                [Fortizar, Fortizar]
                Standup Cloning Center I
                Standup Stasis Webifier I
    </ship-fit>`);

                expect(shadowRoot.querySelectorAll(`use[href="#fitting-box"].slot`))
                    .toHaveLength(23);

                const moduleImages = [...shadowRoot.querySelectorAll(`.module title`)]
                    .map((node) => node.textContent);

                expect(moduleImages)
                    .toEqual([
                        "Standup Stasis Webifier I",
                        "Standup Cloning Center I",
                    ]);
            });
            it("Limits to 5 services", () => {
                // Structures can have more than 5 services but it seems to almost never happen so save the space and limit to 5
                const [component, shadowRoot] = render(`<ship-fit>
            [Keepstar, Keepstar]
            Standup Cloning Center I
            Standup Cloning Center I
            Standup Cloning Center I
            Standup Cloning Center I
            Standup Cloning Center I
            Standup Cloning Center I
</ship-fit>`);

                const moduleImages = [...shadowRoot.querySelectorAll(`.module title`)]
                    .map((node) => node.textContent);

                expect(moduleImages)
                    .toEqual([
                        "Standup Cloning Center I",
                        "Standup Cloning Center I",
                        "Standup Cloning Center I",
                        "Standup Cloning Center I",
                        "Standup Cloning Center I",
                    ]);
            });
        });

        describe("charges", () => {
            it("renders charges", () => {
                const [component, shadowRoot] = render(`<ship-fit>
[Imperial Navy Slicer, slicer]
Small Ancillary Armor Repairer, Nanite Repair Paste
Small Focused Beam Laser II, Aurora S
</ship-fit>`);

                const moduleImages = [...shadowRoot.querySelectorAll(`.module title`)]
                    .map((node) => node.textContent);

                expect(moduleImages)
                    .toEqual([
                        "Small Focused Beam Laser II",
                        "Small Ancillary Armor Repairer",
                        "Aurora S",
                        "Nanite Repair Paste"
                    ]);
            });

            it("does not render charges when 'hide-charges' attribute set", () => {
                const [component, shadowRoot] = render(`<ship-fit hide-charges>
[Imperial Navy Slicer, slicer]
Small Ancillary Armor Repairer, Nanite Repair Paste
Small Focused Beam Laser II, Aurora S
</ship-fit>`);

                expect(shadowRoot.querySelectorAll(`use[href="#fitting-box"]`))
                    .toHaveLength(13);

                const moduleImages = [...shadowRoot.querySelectorAll(`.module title`)]
                    .map((node) => node.textContent);

                expect(moduleImages)
                    .toEqual([
                        "Small Focused Beam Laser II",
                        "Small Ancillary Armor Repairer",
                    ]);
            });

            it("charges can be disabled dynamically", () => {
                const [component, shadowRoot] = render(`<ship-fit>[Imperial Navy Slicer, slicer
Small Focused Beam Laser II, Aurora S
]</ship-fit>`);

                const moduleImages = [...shadowRoot.querySelectorAll(`.module title`)]
                    .map((node) => node.textContent);

                expect(moduleImages)
                    .toEqual([
                        "Small Focused Beam Laser II",
                        "Aurora S",
                    ]);

                component.toggleAttribute("hide-charges");

                const moduleImages2 = [...shadowRoot.querySelectorAll(`.module title`)]
                    .map((node) => node.textContent);

                expect(moduleImages2)
                    .toEqual([
                        "Small Focused Beam Laser II",
                    ]);
            });

        });
    });

    describe("Copy Fitting", () => {

        it("button is visible by default", () => {
            const [component, shadowRoot] = render(`<ship-fit>[Imperial Navy Slicer, slicer]</ship-fit>`);
            expect(shadowRoot.querySelector(".copyIcon")).not.toBe(null)
        });

        it("button can be disabled", () => {
            const [component, shadowRoot] = render(`<ship-fit hide-copy>[Imperial Navy Slicer, slicer]</ship-fit>`);
            expect(shadowRoot.querySelector(".copyIcon")).toBe(null)
        });

        it("button can be disabled dynamically", () => {
            const [component, shadowRoot] = render(`<ship-fit>[Imperial Navy Slicer, slicer]</ship-fit>`);
            expect(shadowRoot.querySelector(".copyIcon")).not.toBe(null);

            component.toggleAttribute("hide-copy");
            expect(shadowRoot.querySelector(".copyIcon")).toBe(null);
        });

        it("copies fitting to clipboard", () => {
            const [component, shadowRoot] = render(`<ship-fit>
[Imperial Navy Slicer, slicer]
Small Focused Beam Laser II, Aurora S
</ship-fit>`);

            let copiedContent = "";
            Object.assign(navigator, {
                clipboard: {
                    writeText: (s: string) => {
                        copiedContent = s
                    }
                }
            });

            const copyIcon = shadowRoot.querySelector(".copyIcon")!;
            fireEvent.click(copyIcon);

            expect(copiedContent).toEqual("\n[Imperial Navy Slicer, slicer]\nSmall Focused Beam Laser II, Aurora S\n")
        });
    });
});

function render(content: string): [Element, ShadowRoot] {
    const testContainer = document.createElement("div");
    document.body.appendChild(testContainer);
    testContainer.innerHTML = content;
    const component = testContainer.children.item(0)!;

    return [component, component.shadowRoot!];
}
