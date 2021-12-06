import {Fit, Slot} from "./fitting-parser";
import {svgElem} from "./html-builder";


export function generateFittingWheelSvg(fit: Fit) {
    return svgElem("svg")
        .classes("fitting-circle")
        .attr("viewBox", "0 0 100 100")
        .children(
            svgElem("defs").children(
                svgElem("clipPath")
                    .id("fitting-circle-image")
                    .children(
                        svgElem("circle")
                            .attr("cx", "50")
                            .attr("cy", "50")
                            .attr("r", "40")
                            .attr("fill", "none")
                            .build(),
                    )
                    .build(),
                svgElem("polygon")
                    .id("fitting-box")
                    .attr("points", "0,1 7,1 6,7 1,7 0,1")
                    .attr("fill", "none")
                    .attr("stroke", "white")
                    .attr("stroke-width", "0.1")
                    .attr("stroke-dasharray", "1")
                    .build()
            ).build(),
            svgElem("image")
                .attr("width", "100")
                .attr("height", "100")
                .attr("x", "0")
                .attr("y", "0")
                .attrNs("http://www.w3.org/1999/xlink", "href", `https://images.evetech.net/types/${fit.shipType.type}/render`)
                .attr("clip-path", "url(#fitting-circle-image)")
                .build(),
            svgElem("circle")
                .attr("cx", "50")
                .attr("cy", "50")
                .attr("r", "35")
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", "10")
                .attr("stroke-opacity", "50%")
                .build(),
            ...getSlots(fit)
        ).build();
}

/*
 * Build up 31 slots around the wheel (8 highs, 8 mids, 8 lows, 3 rigs, and 3 spacers in between racks)
 */
function getSlots(fit: Fit): Element[]{
    const slotCount = 31;
    const allSlotImages = new Array(slotCount).fill(null);

    const highslots = fit.highSlots.map(toImageUrl);
    const mids = fit.midSlots.map(toImageUrl);
    const lows = fit.lowSlots.map(toImageUrl);
    const rigs = fit.rigSlots.map(toImageUrl);
    allSlotImages.splice(0, highslots.length, ...highslots);
    allSlotImages.splice(9, mids.length, ...mids);
    allSlotImages.splice(18, lows.length, ...lows);
    allSlotImages.splice(27, rigs.length, ...rigs);

    const boxes = allSlotImages.map((imgDetails, i) => {

        if (!imgDetails) return; // No slot (different to empty slot)

        const rotateAmount = 360 / slotCount;
        const offset = rotateAmount * 3; // shift the first slot to the left 3 positions otherwise high slots would start in the 12 o'clock position
        const rotate = (i * rotateAmount) - offset;

        const module = svgElem("g")
            .classes("module")
            .children(
                svgElem("use")
                    .attr("x", "45")
                    .attr("y", "11")
                    .attr("transform", `rotate(${rotate} 50 50)` )
                    .attrNs("http://www.w3.org/1999/xlink", "href", "#fitting-box")
                    .build()
            )
            .build();

        const counterRotate = -rotate; //Rotate the module image back around so it's vertical
        if(imgDetails.filled) {
            module.appendChild(
                svgElem("image")
                    .attr("width", "6")
                    .attr("height", "6")
                    .attr("x", "46")
                    .attr("y", "12")
                    .attr("transform", `rotate(${rotate} 50 50) rotate(${counterRotate} 49 15)`)
                    .attrNs("http://www.w3.org/1999/xlink", "href", imgDetails.image)
                    .children(
                        svgElem("title")
                            .text(imgDetails.name)
                            .build()
                    )
                    .build()
            )
        }

        return module;
    });

    // Remove the empty boxes
    return boxes.filter((b) => !!b) as Element[];

}

const toImageUrl = (s: Slot) => s.filled ?
    {
        image: `https://images.evetech.net/types/${s.module.type}/icon?size=32`,
        name: s.module.name,
        filled: true
    } : {filled: false};
