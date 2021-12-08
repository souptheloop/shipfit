import {Fit, Slot} from "./fitting-parser";
import {svgElem} from "./html-builder";


export function generateFittingWheelSvg(fit: Fit) {
    const imageSize = 512;
    return svgElem("svg")
        .classes("fitting-circle")
        .attr("viewBox", "0 0 512 512")
        .children(
            svgElem("defs").children(
                svgElem("clipPath")
                    .id("fitting-circle-image")
                    .children(
                        svgElem("circle")
                            .attr("cx", "256")
                            .attr("cy", "256")
                            .attr("r", "256")
                            .attr("fill", "none")
                            .build(),
                    )
                    .build(),
                svgElem("polygon")
                    .id("fitting-box")
                    .attr("points", "2,2 48,2 43,48 7,48 2,2")
                    .attr("fill", "none")
                    .attr("stroke", "white")
                    .attr("stroke-width", "1")
                    .attr("stroke-dasharray", "1")
                    .build()
            ).build(),
            svgElem("image")
                .attr("width", "512")
                .attr("height", "512")
                .attr("x", "0")
                .attr("y", "0")
                .attrNs("http://www.w3.org/1999/xlink", "href", `https://images.evetech.net/types/${fit.shipType.type}/render`)
                .attr("clip-path", "url(#fitting-circle-image)")
                .build(),
            svgElem("circle")
                .attr("cx", "256")
                .attr("cy", "256")
                .attr("r", "226")
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", "60")
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
        const center = 256;
        const size = 50;
        const module = svgElem("g")
            .classes("module")
            .children(
                svgElem("use")
                    .attr("x", `${center-size/2}`)
                    .attr("y", "5")
                    .attr("transform", `rotate(${rotate} ${center} ${center})`)
                    .attrNs("http://www.w3.org/1999/xlink", "href", "#fitting-box")
                    .build()
            )
            .build();

        const counterRotate = -rotate; //Rotate the module image back around so it's vertical
        if(imgDetails.filled) {
            const size = 46;

            const yOffset = 6;
            module.appendChild(
                svgElem("image")
                    .attr("width", `${size}`)
                    .attr("height", `${size}`)
                    .attr("x", `${center - size/2}`)
                    .attr("y", `${yOffset}`)
                    .attr("transform", `rotate(${rotate} ${center} ${center}) rotate(${counterRotate} ${center} ${yOffset + size/2})`)
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
