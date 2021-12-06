import "@testing-library/jest-dom";
import './fitting';


describe("Fitting Component", () => {

    it("renders module with image and slot", async () => {
        const [component, shadowRoot] = await render(`<ship-fit>
[Imperial Navy Slicer, slicer]

Small Focused Beam Laser II, Aurora S
</ship-fit>`);

        expect(shadowRoot.querySelectorAll(".module"))
            .toHaveLength(1);

        const lazers = shadowRoot.querySelectorAll(".module").item(0);
        expect(lazers.querySelector("use")).toHaveAttribute("href", "#fitting-box");
        expect(lazers.querySelector("image"))
            .toHaveAttribute("href", "https://images.evetech.net/types/3033/icon?size=32");
        expect(lazers.querySelector("image title"))
            .toHaveTextContent("Small Focused Beam Laser II");

    });

    it("renders empty slot without image", async () => {
        const [component, shadowRoot] = await render(`<ship-fit>
[Imperial Navy Slicer, slicer]

[Empty High Slot]
</ship-fit>`);

        expect(shadowRoot.querySelectorAll(".module"))
            .toHaveLength(1);

        const emptyHiSlot = shadowRoot.querySelectorAll(".module").item(0);
        expect(emptyHiSlot.querySelector("use")).toHaveAttribute("href", "#fitting-box");
        expect(emptyHiSlot.querySelector("image")).toBeNull();
    });

    it("renders all expected slots across racks", async () => {
        const [component, shadowRoot] = await render(`<ship-fit>
[Imperial Navy Slicer, slicer]

Heat Sink II
Compact Multispectrum Energized Membrane
[Empty Low slot]
Nanofiber Internal Structure II
Small Ancillary Armor Repairer, Nanite Repair Paste

5MN Quad LiF Restrained Microwarpdrive
[Empty Med slot]

Small Focused Beam Laser II, Aurora S
[Empty High slot]
Small Focused Beam Laser II, Aurora S

[Empty Rig slot]
Small Energy Locus Coordinator II
[Empty Rig slot]
</ship-fit>`);

        expect(shadowRoot.querySelectorAll(`.module use[href="#fitting-box"]`))
            .toHaveLength(13);

        const moduleImages = [...shadowRoot.querySelectorAll(`.module image title`)]
            .map((node) => node.textContent);

        expect(moduleImages)
            .toEqual([
                "Small Focused Beam Laser II",
                "Small Focused Beam Laser II",
                "5MN Quad LiF Restrained Microwarpdrive",
                "Heat Sink II",
                "Compact Multispectrum Energized Membrane",
                "Nanofiber Internal Structure II",
                "Small Ancillary Armor Repairer",
                "Small Energy Locus Coordinator II"
            ]);
    });

    it("renders empty fit", async () => {
        const [component, shadowRoot] = await render(`<ship-fit></ship-fit>`);

        expect(shadowRoot.textContent).toEqual("Error - No fit provided")
    });
});

async function render(content: string): Promise<[Element, ShadowRoot]> {
    const testContainer = document.createElement("div");
    document.body.appendChild(testContainer);
    testContainer.innerHTML = content;
    const component = testContainer.children.item(0)!;

    return [component, component.shadowRoot!];
}
