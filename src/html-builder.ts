
export const svgElem = (name: string) => new ElementBuilder("http://www.w3.org/2000/svg", name);
export class ElementBuilder {
    private elem: Element;
    private childNodes: Element[];

    constructor(ns: null | string, name: string) {
        this.elem = document.createElementNS(ns, name);
        this.childNodes = [];
    }

    id(id: string): ElementBuilder {
        this.elem.id = id;
        return this;
    }

    text(text: string): ElementBuilder {
        this.elem.textContent = text;
        return this;
    }

    classes(...classes: string[]): ElementBuilder {
        this.elem.classList.add(...classes);
        return this;
    }

    attr(name: string, value: string): ElementBuilder {
        this.elem.setAttribute(name, value);
        return this;
    }

    attrNs(ns: string, name: string, value: string): ElementBuilder {
        this.elem.setAttributeNS(ns, name, value);
        return this;
    }

    children(...children: Element[]): ElementBuilder {
        this.childNodes.push(...children);
        return this;
    }

    build(): Element {
        this.elem.append(...this.childNodes);
        return this.elem;
    }
}