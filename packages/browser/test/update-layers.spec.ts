import { updateLayers, createRoot, createBackdropParts } from '../src';
import { HTMLTestDriver } from './html-test-driver';
import { expect } from 'chai';

describe(`update-layers`, () => {
    let testDriver: HTMLTestDriver;
    const backdropParts = createBackdropParts();

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    it(`should append root layer`, () => {
        const { rootLayer, setWrapper } = createRoot();
        const wrapper = document.createElement(`div`);
        setWrapper(wrapper);

        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root layer`).to.equal(1);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
    });

    it(`should append child layer after root layer`, () => {
        const { rootLayer, setWrapper } = createRoot();
        const wrapper = document.createElement(`div`);
        setWrapper(wrapper);

        const childLayer = rootLayer.createLayer();
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root & child layers`).to.equal(2);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `child`).to.equal(childLayer.element);
    });

    it(`should append multiple changes (before first layer update)`, () => {
        const { rootLayer, setWrapper } = createRoot();
        const wrapper = document.createElement(`div`);
        setWrapper(wrapper);

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
        const { rootLayer, setWrapper } = createRoot();
        const wrapper = document.createElement(`div`);
        setWrapper(wrapper);

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

    it(`should add a layer between layers`, () => {
        const { rootLayer, setWrapper } = createRoot();
        const wrapper = document.createElement(`div`);
        setWrapper(wrapper);
        const layerA = rootLayer.createLayer();
        const layerB = rootLayer.createLayer();
        updateLayers(wrapper, rootLayer, backdropParts);

        const layerAChild = layerA.createLayer();
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, A, AChild, B`).to.equal(4);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `layerA`).to.equal(layerA.element);
        expect(wrapper.children[2], `layerB`).to.equal(layerB.element);
        expect(wrapper.children[3], `layerAChild`).to.equal(layerAChild.element);
        expect(wrapper.children[0].getAttribute(`z-index`), `root 1st`).to.equal(`0`);
        expect(wrapper.children[1].getAttribute(`z-index`), `layerA 2nd`).to.equal(`1`);
        expect(wrapper.children[3].getAttribute(`z-index`), `layerAChild 3rd`).to.equal(`2`);
        expect(wrapper.children[2].getAttribute(`z-index`), `layerB 4th`).to.equal(`3`);
        // ToDo: add a screen snapshot test
    });

    it(`should place block element before last layer with backdrop=block`, () => {
        const { rootLayer, setWrapper } = createRoot();
        const wrapper = document.createElement(`div`);
        setWrapper(wrapper);

        const firstLayer = rootLayer.createLayer({
            settings: { backdrop: `block`, overlap: `window` },
        });
        const secondLayer = rootLayer.createLayer({
            settings: { backdrop: `block`, overlap: `window` },
        });
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, first, block, second`).to.equal(4);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `firstLayer`).to.equal(firstLayer.element);
        expect(wrapper.children[2], `block`).to.equal(backdropParts.block);
        expect(wrapper.children[3], `secondLayer`).to.equal(secondLayer.element);
    });

    it(`should place hide+block element before last layer with backdrop=hide`, () => {
        const { rootLayer, setWrapper } = createRoot();
        const wrapper = document.createElement(`div`);
        setWrapper(wrapper);

        const firstLayer = rootLayer.createLayer({
            settings: { backdrop: `hide`, overlap: `window` },
        });
        const secondLayer = rootLayer.createLayer({
            settings: { backdrop: `hide`, overlap: `window` },
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
        const { rootLayer, setWrapper } = createRoot();
        const wrapper = document.createElement(`div`);
        setWrapper(wrapper);

        const firstLayer = rootLayer.createLayer({
            settings: { backdrop: `hide`, overlap: `window` },
        });
        const secondLayer = rootLayer.createLayer({
            settings: { backdrop: `block`, overlap: `window` },
        });
        updateLayers(wrapper, rootLayer, backdropParts);

        expect(wrapper.children.length, `root, hide, first, block, second`).to.equal(5);
        expect(wrapper.children[0], `root`).to.equal(rootLayer.element);
        expect(wrapper.children[1], `hide`).to.equal(backdropParts.hide);
        expect(wrapper.children[2], `firstLayer`).to.equal(firstLayer.element);
        expect(wrapper.children[3], `block`).to.equal(backdropParts.block);
        expect(wrapper.children[4], `secondLayer`).to.equal(secondLayer.element);
    });

    it(`should set attribute inert for all layers before backdrop=block`, () => {
        const { rootLayer, setWrapper } = createRoot();
        const wrapper = document.createElement(`div`);
        setWrapper(wrapper);

        rootLayer.createLayer({ settings: { backdrop: `block`, overlap: `window` } });
        const secondLayer = rootLayer.createLayer({
            settings: { backdrop: `hide`, overlap: `window` },
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
        const { rootLayer, setWrapper } = createRoot();
        setWrapper(wrapper);
        const rootInput = document.createElement(`input`);
        rootLayer.element.appendChild(rootInput);
        wrapper.appendChild(rootLayer.element);
        rootInput.focus();

        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement).to.equal(rootInput);
    });

    it(`should blur within an inert layer`, () => {
        const { container: wrapper } = testDriver.render(() => ``);
        const { rootLayer, setWrapper } = createRoot();
        setWrapper(wrapper);
        const rootInput = document.createElement(`input`);
        rootLayer.element.appendChild(rootInput);
        wrapper.appendChild(rootLayer.element);
        rootInput.focus();
        rootLayer.createLayer({ settings: { backdrop: `block`, overlap: `window` } });

        updateLayers(wrapper, rootLayer, backdropParts);

        expect(document.activeElement, `blur inert`).to.be.oneOf([null, document.body]);
    });
});
