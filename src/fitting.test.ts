import "@testing-library/jest-dom";
import './fitting';


describe("Fitting Component", () => {
    describe("rendering", () => {
        it("renders hello", () => {
            const [component, shadowRoot] = render(`<eve-fit/>`);


            expect(shadowRoot.querySelector(".wrapper")).toHaveTextContent("Hello World!")
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