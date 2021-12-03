import { EftParser } from "./eft-parser";
import { FittingParser } from "./fitting-parser";
import { generateFittingWheelSvg } from "./fitting-wheel";
class Fitting extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: "open" });
        // this.root.addEventListener('mousedown', (event) => {
        //     this.handleClick(event, true);
        //     event.preventDefault();
        // });
        this.root.innerHTML = "";
    }
    static get observedAttributes() {
        return [];
    }
    get config() {
        return {};
    }
    connectedCallback() {
        const observer = new MutationObserver((mutations, observer) => {
            if (mutations.length > 0) {
                const textContent = mutations[0].addedNodes[0].textContent;
                if (!textContent) {
                    this.root.innerHTML = "Error - No fit provided";
                }
                const eftFit = new EftParser().parse(textContent || "");
                const fit = new FittingParser().parse(eftFit);
                this.root.innerHTML = this.getContent(fit);
            }
        });
        observer.observe(this, { childList: true });
    }
    getContent(fit) {
        return `<style>${this.getCss()}</style><div>${this.getHtml(fit)}</div>`;
    }
    getHtml(fit) {
        const highSlotHtml = fit.highSlots.map((slot) => {
            switch (slot.filled) {
                case true:
                    return `<li>${slot.module.name} <img src="https://images.evetech.net/types/${slot.module.type}/icon"/></li>`;
                case false:
                    return `<li>Empty</li>`;
            }
        });
        return generateFittingWheelSvg(fit);
    }
    getCss() {
        return `   
        .wrapper {
          color: red;
        }
        .fitting-circle {
          max-width: 500px;  
        }
        #slot-1 {
         fill: url("https://images.evetech.net/types/2937/icon");
         }
        `;
    }
}
customElements.define("ship-fit", Fitting);
//# sourceMappingURL=fitting.js.map