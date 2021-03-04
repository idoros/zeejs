import { createRoot } from '@zeejs/browser';
import { HTMLTestDriver } from './html-test-driver';
import chai, { expect } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe(`root`, () => {
    let testDriver: HTMLTestDriver;

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    it(`should create a layer with an element`, () => {
        const rootLayer = createRoot();

        expect(rootLayer.element, `root html element`).to.an.instanceOf(HTMLElement);
        expect(rootLayer.element.tagName, `zeejs-layer tag`).to.equal(`ZEEJS-LAYER`);
    });

    it(`should notify on layer added / removed`, () => {
        const onChange = stub();
        const rootLayer = createRoot({ onChange });

        expect(onChange, `no initial call`).to.have.callCount(0);

        const innerLayer = rootLayer.createLayer();

        expect(onChange, `layer added`).to.have.callCount(1);

        innerLayer.createLayer();

        expect(onChange, `deep layer added`).to.have.callCount(2);

        rootLayer.removeLayer(innerLayer);

        expect(onChange, `layer branch removed - single change`).to.have.callCount(3);
    });

    it(`should generate unique id for each layer`, () => {
        const rootLayer = createRoot();

        const layerA = rootLayer.createLayer();
        const layerB = rootLayer.createLayer();

        expect(layerA.id, `layer A id matching element id`).to.equal(layerA.element.id);
        expect(layerB.id, `layer B id matching element id`).to.equal(layerB.element.id);
        expect(layerA.id, `layers unique id`).to.not.equal(layerB.id);
    });

    it(`should create a layer with an element by default`, () => {
        const rootLayer = createRoot();

        const layer = rootLayer.createLayer();

        expect(layer.element, `layer html element`).to.an.instanceOf(HTMLElement);
        expect(layer.element.tagName, `zeejs-layer tag`).to.equal(`ZEEJS-LAYER`);
    });

    it(`should allow an external element to be created for a layer`, () => {
        const onChange = stub();
        const rootLayer = createRoot({ onChange });

        const layer = rootLayer.createLayer({
            settings: { generateElement: false },
        });

        expect(layer.element, `no initial element`).to.equal(null);
        expect(onChange, `layer added`).to.have.callCount(1);

        expect(() => {
            layer.setElement(document.createElement(`div`));
        }).to.throw(`cannot setElement on a layer that is not <zeejs-layer>`);

        layer.setElement(document.createElement(`zeejs-layer`));

        expect(layer.element, `layer html element`).to.an.instanceOf(HTMLElement);
        expect(layer.element.tagName, `zeejs-layer tag`).to.equal(`ZEEJS-LAYER`);
        expect(onChange, `element added to layer`).to.have.callCount(2);

        expect(() => {
            layer.setElement(document.createElement(`zeejs-layer`));
        }).to.throw(`cannot setElement on a layer that was already initiated with an element`);
    });
});
