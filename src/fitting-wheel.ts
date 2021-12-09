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
function getSlots(fit: Fit): Element[] {
    const slotCount = 31;
    const allSlotImages: WheelSlot[] = new Array(slotCount).fill(null);

    const highslots = fit.highSlots.map(toImageUrl);
    const mids = fit.midSlots.map(toImageUrl);
    const lows = fit.lowSlots.map(toImageUrl);
    const rigs = fit.rigSlots.map(toImageUrl);
    allSlotImages.splice(0, highslots.length, ...highslots);
    allSlotImages.splice(9, mids.length, ...mids);
    allSlotImages.splice(18, lows.length, ...lows);
    allSlotImages.splice(27, rigs.length, ...rigs);


    const moduleRotations = rotationsForArc(360, 31, 3);
    const modules = [
        ...getSlotSvgs(6, moduleRotations, allSlotImages),
        ...getModuleSvgs(8, moduleRotations, allSlotImages)];

    const ammoImages: WheelSlot[] = new Array(31).fill(null);
    const ammoRotations = rotationsForArc(360, 31, 3);
    const ammo = [...getModuleSvgs(35, ammoRotations, ammoImages)];

    const subsystemImages = fit.subsystemSlots.map(toImageUrl);
    const subsystemRotations = rotationsForArc(90, 4, 9.5);
    const subsystems = [
        ...getSlotSvgs(100, subsystemRotations, subsystemImages),
        ...getModuleSvgs(100, subsystemRotations, subsystemImages)];

    const serviceImages = fit.serviceSlots.map(toImageUrl).slice(0, 5);
    const serviceRotations = rotationsForArc(120, 5, 9.5);
    const services = [
        ...getSlotSvgs(100, serviceRotations, serviceImages),
        ...getModuleSvgs(100, serviceRotations, serviceImages)];

    // Remove the empty boxes
    return [...modules, ...ammo, ...subsystems, ...services].filter((b) => !!b) as Element[];

}

type WheelSlot = FilledSlot | EmptySlot | null;


function rotationsForArc(arc: number, count: number, offset: number): number[] {
    const rotationAmount = arc / count;
    const startOffset = offset * rotationAmount;

    return new Array(count).fill(null).map((a, i) => {
        return (i * rotationAmount) - startOffset;
    })
}

function getSlotSvgs(yOffset: number, rotations: number[], modules: WheelSlot[]) {
    return modules.map((imgDetails, i) => {

        if (!imgDetails) return; // No slot (different to empty slot)

        const rotate = rotations[i];

        const center = 256;
        const slotOutlineSize = 50;
        return svgElem("use")
            .classes("slot")
            .attr("x", `${center - slotOutlineSize / 2}`)
            .attr("y", `${yOffset}`)
            .attr("transform", `rotate(${rotate} ${center} ${center})`)
            .attrNs("http://www.w3.org/1999/xlink", "href", "#fitting-box")
            .build()
    });
}


function getModuleSvgs(yOffset: number, rotations: number[], modules: WheelSlot[]) {
    return modules.map((imgDetails, i) => {

        if (!imgDetails) return; // No slot (different to empty slot)

        const rotate = rotations[i];
        const center = 256;

        const counterRotate = -rotate; //Rotate the module image back around so it's vertical
        if (imgDetails.filled) {
            const moduleImageSize = 46;

            return svgElem("image")
                .classes("module")
                .attr("width", `${moduleImageSize}`)
                .attr("height", `${moduleImageSize}`)
                .attr("x", `${center - moduleImageSize / 2}`)
                .attr("y", `${yOffset}`)
                .attr("transform", `rotate(${rotate} ${center} ${center}) rotate(${counterRotate} ${center} ${yOffset + moduleImageSize / 2})`)
                .attrNs("http://www.w3.org/1999/xlink", "href", imgDetails.image)
                .children(
                    svgElem("title")
                        .text(imgDetails.name)
                        .build()
                )
                .build();
        }
    });
}

interface FilledSlot {
    filled: true,
    image: string,
    name: string
}

interface EmptySlot {
    filled: false
}

const toImageUrl = (s: Slot): WheelSlot => s.filled ?
    {
        image: `https://images.evetech.net/types/${s.module.type}/icon?size=64`,
        name: s.module.name,
        filled: true
    } : {filled: false};
