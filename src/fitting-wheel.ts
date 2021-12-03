import {Fit, Slot} from "./fitting-parser";

export function generateFittingWheelSvg(fit: Fit) {
    const slots = getSlots(fit);

    return `
<svg class="fitting-circle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    
    <defs>
        <clipPath id="fitting-circle-image">
            <circle cx="50" cy="50" r="40" fill="none"></circle>
        </clipPath>
        <g id="fitting-box" fill="none" stroke="white" stroke-width="0.1" stroke-dasharray="1">
            <polygon  points="0,1 7,1 6,7 1,7 0,1" />
        </g>
    </defs>
    
    <image width="100" height="100" x="0" y="0"
        xlink:href="https://images.evetech.net/types/${fit.shipType.type}/render"
        clip-path="url(#fitting-circle-image)" 
        />
        
    <circle cx="50" cy="50" r="35" fill="none" stroke="black" stroke-width="10" stroke-opacity="50%" />
    
    ${slots}
</svg>`;
}

/*
 * Build up 31 slots around the wheel (8 highs, 8 mids, 8 lows, 3 rigs, and 3 spacers in between racks)
 *
 */
function getSlots(fit: Fit) {
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

        if(!imgDetails) return; //No slot (different to empty slot)

        const rotateAmount = 360 / slotCount;
        const offset = rotateAmount * 3; //shift the first slot to the left 3 positions otherwise high slots would start in the 12 o'clock position
        const rotate = (i * rotateAmount) - offset;

        // Rotate the image back so it's vertical, +3 to account for the fact we start 3 to the left
        const counterRotate = -rotate;
        let image = imgDetails.filled ?
            `<image width="6" height="6" x="46" y="12" transform="rotate(${counterRotate} 49 15)" xlink:href="${imgDetails.image}" />`
            : "";

        //#fitting-box defined later on in svg
        return `
<g  transform="rotate(${rotate} 50 50)">
    <use x="45" y="11" id="slot-${i}" xlink:href="#fitting-box" ></use>
    ${image}
</g>
`
    });

    // Remove the dividers between the racks
    return boxes.filter((a, i) => {
        return ![8, 17, 26, 30].includes(i);
    });
}

const toImageUrl = (s: Slot) => s.filled ?
    {image: `https://images.evetech.net/types/${s.module.type}/icon?size=32`, filled: true} : {filled: false};
