import {EftParser} from "./eft-parser";
import {Fit, FittingParser} from "./fitting-parser";
import {generateFittingWheelSvg} from "./fitting-wheel";
import {elem, svgElem} from "./html-builder";

export interface FittingElement extends HTMLElement {

}

interface FittingAttributes {

}

class Fitting extends HTMLElement implements FittingElement {
    private root: ShadowRoot;

    static get observedAttributes() {
        return []
    }

    get config(): FittingAttributes {
        return {};
    }

    constructor() {
        super();
        this.root = this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        // Chrome can't see text at this point and tests can't trigger mutation observer. Just attempt to render either way for now
        this.render(this.textContent);

        const observer = new MutationObserver((mutations: MutationRecord[], observer) => {
            if (mutations.length > 0) {
                const textContent = mutations[0].addedNodes[0].textContent;
                this.render(textContent);
            }
        });
        observer.observe(this, {childList: true});
    }

    private render(textContent: string | null) {
        if (!textContent) {
            this.root.textContent = "Error - No fit provided";
            return;
        }

        const eftFit = new EftParser().parse(textContent);
        const fit = new FittingParser().parse(eftFit);

        this.root.innerHTML = "";
        this.root.append(
            elem("div").children(
                this.getCss(),
                generateFittingWheelSvg(fit)
            ).build()
        )
    }


    getCss() {
        const css = document.createElement("style");
        css.innerHTML = `
        .fitting-circle {
          max-width: 500px;  
        }
        `;
        return css;
    }
}

customElements.define("ship-fit", Fitting);