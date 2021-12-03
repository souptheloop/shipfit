export function generateFittingWheelSvg(fit) {
    const imageMap = new Array(31).fill("");
    const toImageUrl = (s) => s.filled ?
        { image: `https://images.evetech.net/types/${s.module.type}/icon?size=32`, filled: true } : { filled: false };
    const highslots = fit.highSlots.map(toImageUrl);
    const mids = fit.midSlots.map(toImageUrl);
    const lows = fit.lowSlots.map(toImageUrl);
    const rigs = fit.rigSlots.map(toImageUrl);
    imageMap.splice(0, highslots.length, ...highslots);
    imageMap.splice(9, mids.length, ...mids);
    imageMap.splice(18, lows.length, ...lows);
    imageMap.splice(27, rigs.length, ...rigs);
    const boxes = new Array(31).fill(1).map((a, i) => {
        const rotateAmount = 11.6;
        const rotate = (i * rotateAmount) - (rotateAmount * 3); //start 3 positions to the left from the top
        if (!imageMap[i])
            return;
        let image = imageMap[i].filled ? `<image width="6" height="6" x="46" y="12" transform="rotate(${(-i + 3) * (360 / 31)} 49 15)"
           xlink:href="${imageMap[i].image}" />` : "";
        return `

<g  transform="rotate(${rotate} 50 50)">
    <use x="45" y="11" id="slot-${i}" xlink:href="#fitting-box" ></use>
    <!-- Rotate the image back so it's vertical, +3 to accoutd for the fact we start 3 to the left -->
    ${image}
</g>
`;
    });
    const filteredBoxes = boxes.filter((a, i) => {
        return ![8, 17, 26, 30].includes(i);
    });
    return `<div class="wrapper">
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
    <circle cx="50" cy="50" r="35" fill="none" stroke="black" stroke-width="10" stroke-opacity="50%"></circle>
  ${filteredBoxes}
</svg>`;
}
//# sourceMappingURL=fitting-wheel.js.map