import { watchEscape, createRoot, updateLayers, createBackdropParts } from '@zeejs/browser';
import { HTMLTestDriver } from './html-test-driver';
import { getInteractionApi } from '@zeejs/test-browser-bridge';
import chai, { expect } from 'chai';
import { stub, spy } from 'sinon';
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
    it(`should propagate event down the layers`, async function () {
        const onChildAEscape = stub();
        const onChildBEscape = stub();
        const { container } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        rootLayer.createLayer({ settings: { onEscape: onChildAEscape } });
        rootLayer.createLayer({ settings: { onEscape: onChildBEscape } });
        updateLayers(container, rootLayer, createBackdropParts());

        watchEscape(rootLayer);

        await keyboard.press(`Escape`);

        expect(onChildAEscape, `escape A`).to.have.callCount(1);
        expect(onChildBEscape, `escape B`).to.have.callCount(1);
    });
    it(`should propagate event down the layers until stopPropagation is called`, async function () {
        const onChildAEscape = spy();
        const onChildBEscape = spy((e: KeyboardEvent) => e.stopPropagation());
        const onChildCEscape = spy();
        const { container } = testDriver.render(() => ``);
        const rootLayer = createRoot();
        rootLayer.createLayer({ settings: { onEscape: onChildAEscape } });
        const b = rootLayer.createLayer({ settings: { onEscape: onChildBEscape } });
        b.createLayer({ settings: { onEscape: onChildCEscape } });
        updateLayers(container, rootLayer, createBackdropParts());

        watchEscape(rootLayer);

        await keyboard.press(`Escape`);

        expect(onChildCEscape, `c`).to.have.callCount(1);
        expect(onChildBEscape, `b`).to.have.callCount(1);
        expect(onChildAEscape, `a`).to.have.callCount(0);
    });
});
