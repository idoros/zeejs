import { watchEscape, createRoot, updateLayers, createBackdropParts } from '@zeejs/browser';
import { HTMLTestDriver } from './html-test-driver';
import { getInteractionApi } from '@zeejs/test-browser-bridge';
import chai, { expect } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe(`escape`, () => {
    let testDriver: HTMLTestDriver;
    const { keyboard } = getInteractionApi();

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());
    it(`should inform layer on escape press`, async function () {
        const onChildEscape = stub();
        const { container } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        rootLayer.createLayer({ settings: { onEscape: onChildEscape } });
        updateLayers(container, rootLayer, createBackdropParts());

        watchEscape(rootLayer);

        await keyboard.press(`Escape`);

        expect(onChildEscape).to.have.callCount(1);
    });
    it(`should inform only the top layer`, async function () {
        const onLayerAEscape = stub();
        const onLayerBEscape = stub();
        const { container } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        const layerA = rootLayer.createLayer({ settings: { onEscape: onLayerAEscape } });
        const layerB = rootLayer.createLayer({ settings: { onEscape: onLayerBEscape } });
        updateLayers(container, rootLayer, createBackdropParts());

        watchEscape(rootLayer);

        await keyboard.press(`Escape`);

        expect(onLayerAEscape, `A not top`).to.have.callCount(0);
        expect(onLayerBEscape, `B is top`).to.have.callCount(1);

        rootLayer.removeLayer(layerB);
        await keyboard.press(`Escape`);

        expect(onLayerAEscape, `A is top`).to.have.callCount(1);
        expect(onLayerBEscape, `B not connected`).to.have.callCount(1);

        rootLayer.removeLayer(layerA);
        await keyboard.press(`Escape`);

        expect(onLayerAEscape, `A not connected`).to.have.callCount(1);
        expect(onLayerBEscape, `B not connected`).to.have.callCount(1);
    });
    it(`should ignore if preventDefault is triggered`, async function () {
        const onChildEscape = stub();
        const { container } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        rootLayer.createLayer({ settings: { onEscape: onChildEscape } });
        updateLayers(container, rootLayer, createBackdropParts());
        container.onkeydown = (event) => event.preventDefault();
        container.tabIndex = 1;
        container.focus();

        watchEscape(rootLayer);

        await keyboard.press(`Escape`);

        expect(onChildEscape).to.have.callCount(0);
    });
    it(`should ignore if stopPropagation is triggered`, async function () {
        const onChildEscape = stub();
        const { container } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        rootLayer.createLayer({ settings: { onEscape: onChildEscape } });
        updateLayers(container, rootLayer, createBackdropParts());
        container.onkeydown = (event) => event.stopPropagation();
        container.tabIndex = 1;
        container.focus();

        watchEscape(rootLayer);

        await keyboard.press(`Escape`);

        expect(onChildEscape).to.have.callCount(0);
    });
    it(`should ignore repeated escape due to key being down`, async function () {
        const onChildEscape = stub();
        const { container } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        rootLayer.createLayer({ settings: { onEscape: onChildEscape } });
        updateLayers(container, rootLayer, createBackdropParts());

        watchEscape(rootLayer);

        await keyboard.down(`Escape`);
        await keyboard.down(`Escape`);
        await keyboard.down(`Escape`);
        await keyboard.up(`Escape`);

        expect(onChildEscape).to.have.callCount(1);
    });
    // propagate event down the layers
    // pass event to handler
});
