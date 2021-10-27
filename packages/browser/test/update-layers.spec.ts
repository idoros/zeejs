import { updateLayers, watchFocus, createRoot, createBackdropParts, css } from '@zeejs/browser';
import { HTMLTestDriver } from './html-test-driver';
import { expectImageSnapshot } from '@zeejs/test-browser-bridge';
import { expect } from 'chai';

describe(`update-layers`, () => {
    let testDriver: HTMLTestDriver;
    const backdropParts = createBackdropParts();

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    it(`should append root layer`, () => {
        const rootLayer = createRoot();
        const wrapper = document.createElement(`div`);

        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root layer`).to.equal(1);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
    });

    it(`should append child layer after root layer`, () => {
        const rootLayer = createRoot();
        const wrapper = document.createElement(`div`);

        const childLayer = rootLayer.createLayer();
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root & child layers`).to.equal(2);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `child`).to.equal(childLayer.element);
    });

    it(`should append multiple changes (before first layer update)`, () => {
        const rootLayer = createRoot();
        const wrapper = document.createElement(`div`);

        const layerA = rootLayer.createLayer();
        const layerAChild = layerA.createLayer();
        const layerB = rootLayer.createLayer();
        const layerBChild = layerB.createLayer();
        layerA.removeLayer(layerAChild);
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, A, B & BChild layers`).to.equal(4);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `layerA`).to.equal(layerA.element);
        expect(wrapper.children[2], `layerB`).to.equal(layerB.element);
        expect(wrapper.children[3], `layerBChild`).to.equal(layerBChild.element);
    });

    it(`should remove layers`, () => {
        const rootLayer = createRoot();
        const wrapper = document.createElement(`div`);
        const layerA = rootLayer.createLayer();
        const layerAChild = layerA.createLayer();
        const layerB = rootLayer.createLayer();
        const layerBChild = layerB.createLayer();

        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, A, AChild, B & BChild layers`).to.equal(5);

        layerA.removeLayer(layerAChild);
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, A, B & BChild layers`).to.equal(4);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `layerA`).to.equal(layerA.element);
        expect(wrapper.children[2], `layerB`).to.equal(layerB.element);
        expect(wrapper.children[3], `layerBChild`).to.equal(layerBChild.element);
    });

    it(`should add a layer between layers`, async () => {
        const rootLayer = createRoot();
        const { expectHTMLQuery } = testDriver.render(
            () => `
            <style>${css}</style>
            <div id="wrapper"></div>
            <div id="root-node" style="width: 100px; height: 100px; background: red;"></div>
            <div id="layerA-node" style="width: 80px; height: 80px; background: green;"></div>
            <div id="layerAChild-node" style="width: 60px; height: 60px; background: blue;"></div>
            <div id="layerB-node" style="width: 40px; height: 40px; background: gold;"></div>
        `
        );
        const wrapper = expectHTMLQuery(`#wrapper`);
        const layerA = rootLayer.createLayer();
        const layerB = rootLayer.createLayer();
        rootLayer.element.appendChild(expectHTMLQuery(`#root-node`));
        layerA.element.appendChild(expectHTMLQuery(`#layerA-node`));
        layerB.element.appendChild(expectHTMLQuery(`#layerB-node`));
        const layerAChildNode = expectHTMLQuery(`#layerAChild-node`);
        updateLayers(wrapper, rootLayer, backdropParts);

        const layerAChild = layerA.createLayer();
        layerAChild.element.appendChild(layerAChildNode);
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, A, AChild, B`).to.equal(4);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `layerA`).to.equal(layerA.element);
        expect(wrapper.children[2], `layerB`).to.equal(layerB.element);
        expect(wrapper.children[3], `layerAChild`).to.equal(layerAChild.element);
        expect(rootLayer.element.style.zIndex, `root 1st`).to.equal(`0`);
        expect(layerA.element.style.zIndex, `layerA 2nd`).to.equal(`1`);
        expect(layerAChild.element.style.zIndex, `layerAChild 3rd`).to.equal(`2`);
        expect(layerB.element.style.zIndex, `layerB 4th`).to.equal(`3`);
        await expectImageSnapshot({
            filePath: `update-layers/should add a layer between layers`,
        });
    });

    it(`should handle layers with delayed element creation`, () => {
        const rootLayer = createRoot();
        const wrapper = document.createElement(`div`);

        const parentLayer = rootLayer.createLayer({
            settings: { generateElement: false },
        });
        const childLayer = parentLayer.createLayer();
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `skip parent layer element`).to.equal(2);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `child`).to.equal(childLayer.element);

        parentLayer.setElement(document.createElement(`zeejs-layer`));
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `parent layer element added`).to.equal(3);
    });

    it(`should place block element before last layer with backdrop=block`, () => {
        const rootLayer = createRoot();
        const wrapper = document.createElement(`div`);

        const firstLayer = rootLayer.createLayer({
            settings: { backdrop: `block` },
        });
        const secondLayer = rootLayer.createLayer({
            settings: { backdrop: `block` },
        });
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, first, block, second`).to.equal(4);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `firstLayer`).to.equal(firstLayer.element);
        expect(wrapper.children[2], `block`).to.equal(backdropParts.block);
        expect(wrapper.children[3], `secondLayer`).to.equal(secondLayer.element);
    });

    it(`should place hide+block element before last layer with backdrop=hide`, () => {
        const rootLayer = createRoot();
        const wrapper = document.createElement(`div`);

        const firstLayer = rootLayer.createLayer({
            settings: { backdrop: `hide` },
        });
        const secondLayer = rootLayer.createLayer({
            settings: { backdrop: `hide` },
        });
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, first, hide, block, second`).to.equal(5);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `firstLayer`).to.equal(firstLayer.element);
        expect(wrapper.children[2], `hide`).to.equal(backdropParts.hide);
        expect(wrapper.children[3], `block`).to.equal(backdropParts.block);
        expect(wrapper.children[4], `secondLayer`).to.equal(secondLayer.element);
    });

    it(`should place hide & block separately before last layers with backdrop=hide/block`, () => {
        const rootLayer = createRoot();
        const wrapper = document.createElement(`div`);

        const firstLayer = rootLayer.createLayer({
            settings: { backdrop: `hide` },
        });
        const secondLayer = rootLayer.createLayer({
            settings: { backdrop: `block` },
        });
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, hide, first, block, second`).to.equal(5);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `hide`).to.equal(backdropParts.hide);
        expect(wrapper.children[2], `firstLayer`).to.equal(firstLayer.element);
        expect(wrapper.children[3], `block`).to.equal(backdropParts.block);
        expect(wrapper.children[4], `secondLayer`).to.equal(secondLayer.element);
    });

    it(`should remove hide/block when blocking layer is removed`, () => {
        const wrapper = document.createElement(`div`);
        const rootLayer = createRoot();
        rootLayer.element.id = ``; // root can be override and doesn't require id
        const blockingLayer = rootLayer.createLayer({
            settings: { backdrop: `hide` },
        });
        updateLayers(wrapper, rootLayer, backdropParts);

        rootLayer.removeLayer(blockingLayer);
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root`).to.equal(1);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
    });

    it(`should set attribute inert for all layers before backdrop=block (separated hide&block)`, () => {
        const wrapper = document.createElement(`div`);
        const rootLayer = createRoot();
        const layer2 = rootLayer.createLayer({ settings: { backdrop: `hide` } });
        const layer3 = rootLayer.createLayer({ settings: { backdrop: `block` } });

        updateLayers(wrapper, rootLayer, backdropParts);

        expect(Array.from(wrapper.children), `order`).to.eql([
            rootLayer.element,
            backdropParts.hide,
            layer2.element,
            backdropParts.block,
            layer3.element,
        ]);
        expect(rootLayer.element.hasAttribute(`inert`), `root inert`).to.equal(true);
        expect(layer2.element.hasAttribute(`inert`), `layer2 inert`).to.equal(true);
        expect(layer3.element.hasAttribute(`inert`), `layer3 not inert`).to.equal(false);
    });

    it(`should set attribute inert for all layers before backdrop=block`, () => {
        const wrapper = document.createElement(`div`);
        const rootLayer = createRoot();
        rootLayer.createLayer({ settings: { backdrop: `block` } });
        const secondLayer = rootLayer.createLayer({
            settings: { backdrop: `hide` },
        });
        secondLayer.createLayer();
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, first, hide, block, second, secondChild`).to.equal(
            6
        );
        expect(wrapper.children[0].hasAttribute(`inert`), `root inert`).to.equal(true);
        expect(wrapper.children[1].hasAttribute(`inert`), `firstLayer inert`).to.equal(true);
        expect(wrapper.children[2].hasAttribute(`inert`), `hide not inert`).to.equal(false);
        expect(wrapper.children[3].hasAttribute(`inert`), `block not inert`).to.equal(false);
        expect(wrapper.children[4].hasAttribute(`inert`), `secondLayer not inert`).to.equal(false);
        expect(wrapper.children[5].hasAttribute(`inert`), `secondLayer child not inert`).to.equal(
            false
        );

        rootLayer.removeLayer(secondLayer);
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, block, first`).to.equal(3);
        expect(wrapper.children[0].hasAttribute(`inert`), `root inert after change`).to.equal(true);
        expect(wrapper.children[1].hasAttribute(`inert`), `block not inert after change`).to.equal(
            false
        );
        expect(
            wrapper.children[2].hasAttribute(`inert`),
            `firstLayer not inert after change`
        ).to.equal(false);
    });

    it(`should keep focus within a layer`, () => {
        const { container: wrapper } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        const rootInput = document.createElement(`input`);
        rootLayer.element.appendChild(rootInput);
        wrapper.appendChild(rootLayer.element);
        rootInput.focus();

        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement).to.equal(rootInput);
    });

    it(`should blur within an inert layer`, () => {
        const { container: wrapper } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        watchFocus(wrapper, rootLayer);
        const rootInput = document.createElement(`input`);
        rootLayer.element.appendChild(rootInput);
        wrapper.appendChild(rootLayer.element);
        rootInput.focus();
        rootLayer.createLayer({ settings: { backdrop: `block` } });

        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement, `blur inert`).to.be.oneOf([null, document.body]);
    });

    it(`should re-focus last focused element of activate layer`, () => {
        const { container: wrapper } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        watchFocus(wrapper, rootLayer);
        const rootInput = document.createElement(`input`);
        rootLayer.element.appendChild(rootInput);
        wrapper.appendChild(rootLayer.element);
        rootInput.focus();
        const blockingLayer = rootLayer.createLayer({
            settings: { backdrop: `block` },
        });

        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement, `blur inert`).to.be.oneOf([null, document.body]);

        rootLayer.removeLayer(blockingLayer);
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement, `refocus`).to.be.equal(rootInput);
    });

    it(`should re-focus last focused element of TOP activated layer`, () => {
        const { container: wrapper } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        watchFocus(wrapper, rootLayer);
        const rootInput = document.createElement(`input`);
        const middleLayerInput = document.createElement(`input`);
        rootLayer.element.appendChild(rootInput);
        wrapper.appendChild(rootLayer.element);
        rootInput.focus();
        const middleLayer = rootLayer.createLayer();
        middleLayer.element.appendChild(middleLayerInput);
        updateLayers(wrapper, rootLayer, backdropParts);
        middleLayerInput.focus();

        const blockingLayer = rootLayer.createLayer({
            settings: { backdrop: `block` },
        });
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement, `blur inert`).to.be.oneOf([null, document.body]);

        rootLayer.removeLayer(blockingLayer);
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement, `refocus`).to.be.equal(middleLayerInput);
    });

    it(`should re-focus last focused element of TOP activated layer that HAD focus`, () => {
        const { container: wrapper } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        watchFocus(wrapper, rootLayer);
        const rootInput = document.createElement(`input`);
        const middleLayerInput = document.createElement(`input`);
        rootLayer.element.appendChild(rootInput);
        wrapper.appendChild(rootLayer.element);
        rootInput.focus();
        const middleLayer = rootLayer.createLayer();
        middleLayer.element.appendChild(middleLayerInput);
        updateLayers(wrapper, rootLayer, backdropParts);

        const blockingLayer = rootLayer.createLayer({
            settings: { backdrop: `block` },
        });
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement, `blur inert`).to.be.oneOf([null, document.body]);

        rootLayer.removeLayer(blockingLayer);
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement, `refocus`).to.be.equal(rootInput);
    });

    it(`should maintain focus in active layer even when a re-activated layer had previous focus`, () => {
        const { container: wrapper } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        watchFocus(wrapper, rootLayer);
        const rootInput = document.createElement(`input`);
        const topLayerInput = document.createElement(`input`);
        rootLayer.element.appendChild(rootInput);
        wrapper.appendChild(rootLayer.element);
        rootInput.focus();
        const middleLayer = rootLayer.createLayer({
            settings: { backdrop: `block` },
        });
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement, `blur inert`).to.be.oneOf([null, document.body]);

        const topLayer = rootLayer.createLayer();
        topLayer.element.appendChild(topLayerInput);
        updateLayers(wrapper, rootLayer, backdropParts);
        topLayerInput.focus();

        expect(document.activeElement, `top focus`).to.equal(topLayerInput);

        rootLayer.removeLayer(middleLayer);
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement, `top focus not changed`).to.equal(topLayerInput);
    });

    it(`should focus the top most non-inert layer with force param`, () => {
        const { container, expectHTMLQuery } = testDriver.render(
            () => `
            <input id="root"/>
            <input id="child"/>
        `
        );
        const rootLayer = createRoot();
        watchFocus(container, rootLayer);
        const childLayer = rootLayer.createLayer();
        rootLayer.element.appendChild(expectHTMLQuery(`#root`));
        childLayer.element.appendChild(expectHTMLQuery(`#child`));
        container.appendChild(rootLayer.element);
        (rootLayer.element.firstElementChild as HTMLElement).focus();
        (childLayer.element.firstElementChild as HTMLElement).focus();
        updateLayers(container, rootLayer, backdropParts);

        rootLayer.removeLayer(childLayer);
        updateLayers(container, rootLayer, backdropParts, { forceFocus: true });

        expect(document.activeElement, `top focus not changed`).to.equal(expectHTMLQuery(`#root`));
    });

    it(`should focus the first focusable in case the last focused element is not focusable (in the same layer)`, () => {
        // ToDo: improve on this behavior
        // - focus closest focusable instead of just the first
        // - search for candidates in lower non inert layers
        const { container, expectHTMLQuery } = testDriver.render(
            () => `
            <div id="root-inputs">
                <input id="input1"/>
                <input id="input2" disabled/>
                <input id="input3"/>
                <input id="input4" disabled/>
                <input id="input5"/>
            </div>
            <input id="child-input"/>
        `
        );
        const rootLayer = createRoot();
        watchFocus(container, rootLayer);
        const childLayer = rootLayer.createLayer();
        rootLayer.element.appendChild(expectHTMLQuery(`#root-inputs`));
        childLayer.element.appendChild(expectHTMLQuery(`#child-input`));

        updateLayers(container, rootLayer, backdropParts);

        expectHTMLQuery(`#input3`).focus();
        expectHTMLQuery(`#child-input`).focus();
        expectHTMLQuery(`#input3`).setAttribute(`disabled`, ``);

        rootLayer.removeLayer(childLayer);
        updateLayers(container, rootLayer, backdropParts, { forceFocus: true });

        expect(document.activeElement).to.equal(expectHTMLQuery(`#input1`));
    });

    it(`should optionally blur/refocus asynchronically`, async () => {
        const { container: wrapper } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        watchFocus(wrapper, rootLayer);
        const rootInput = document.createElement(`input`);
        rootLayer.element.appendChild(rootInput);
        wrapper.appendChild(rootLayer.element);
        rootInput.focus();
        const blockingLayer = rootLayer.createLayer({
            settings: { backdrop: `block` },
        });

        const waitForBlur = updateLayers(wrapper, rootLayer, backdropParts, {
            asyncFocusChange: true,
        });

        expect(document.activeElement, `no sync blur 1`).to.equal(rootInput);

        await waitForBlur;

        expect(document.activeElement, `async blur`).to.be.oneOf([null, document.body]);

        rootLayer.removeLayer(blockingLayer);
        const waitForRefocus = updateLayers(wrapper, rootLayer, backdropParts, {
            asyncFocusChange: true,
        });

        expect(document.activeElement, `no sync blur 2`).to.be.oneOf([null, document.body]);

        await waitForRefocus;

        expect(document.activeElement, `async re-focus`).to.equal(rootInput);
    });
});
