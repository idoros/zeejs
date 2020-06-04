import { watchClickOutside, createRoot, updateLayers, createBackdropParts } from '../src';
import { HTMLTestDriver } from './html-test-driver';
import { getInteractionApi } from '@zeejs/test-browser/browser';
import chai, { expect } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe(`click-outside`, () => {
    let testDriver: HTMLTestDriver;
    const { click } = getInteractionApi();

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    it(`should inform layer on root click`, async () => {
        const onClickOutside = stub();
        const { container, expectQuery } = testDriver.render(
            () => `
            <div id="root-node" style="width: 100px; height: 100px; background: green;"></div>
            <div id="child-node" style="width: 50px; height: 50px; background: red;"></div>
        `
        );
        const rootLayer = createRoot();
        const childLayer = rootLayer.createLayer({ settings: { onClickOutside } });
        rootLayer.element.appendChild(expectQuery(`#root-node`));
        childLayer.element.appendChild(expectQuery(`#child-node`));
        updateLayers(container, rootLayer, createBackdropParts());

        watchClickOutside(container, rootLayer);

        await click(`#root-node`);

        expect(onClickOutside, `catch click on root`).to.have.callCount(1);

        await click(`#child-node`);

        expect(onClickOutside, `no dispatch for layer click`).to.have.callCount(1);
    });

    it(`should not be called when an internal layer is clicked`, async () => {
        const onShallowClickOutside = stub();
        const onDeepClickOutside = stub();
        const { container, expectQuery } = testDriver.render(
            () => `
            <div id="root-node" style="width: 100px; height: 100px; background: green;"></div>
            <div id="shallow-node" style="width: 50px; height: 50px; background: orange;"></div>
            <div id="deep-node" style="width: 25px; height: 25px; background: red;"></div>
        `
        );
        const rootLayer = createRoot();
        const shallowLayer = rootLayer.createLayer({
            settings: { onClickOutside: onShallowClickOutside },
        });
        const deepLayer = shallowLayer.createLayer({
            settings: { onClickOutside: onDeepClickOutside },
        });
        rootLayer.element.appendChild(expectQuery(`#root-node`));
        shallowLayer.element.appendChild(expectQuery(`#shallow-node`));
        deepLayer.element.appendChild(expectQuery(`#deep-node`));
        updateLayers(container, rootLayer, createBackdropParts());

        watchClickOutside(container, rootLayer);

        await click(`#root-node`);

        expect(onShallowClickOutside, `catch click on root for shallow`).to.have.callCount(1);
        expect(onDeepClickOutside, `catch click on root for deep`).to.have.callCount(1);

        await click(`#shallow-node`);

        expect(onDeepClickOutside, `catch click on parent for deep`).to.have.callCount(2);

        await click(`#deep-node`);

        expect(onShallowClickOutside, `no dispatch for nested layers`).to.have.callCount(1);
        expect(onDeepClickOutside, `no dispatch for layer click (deep)`).to.have.callCount(2);
    });

    it(`should inform layer on another layer click`, async () => {
        const onClickOutsideA = stub();
        const onClickOutsideB = stub();
        const { container, expectQuery } = testDriver.render(
            () => `
            <div id="root-node" style="width: 100px; height: 100px; background: darkgreen;"></div>
            <div id="layerA-node" style="width: 50px; height: 50px; background: red;"></div>
            <div id="layerB-node" style="width: 50px; height: 50px; background: green;"></div>
        `
        );
        const rootLayer = createRoot();
        const aLayer = rootLayer.createLayer({ settings: { onClickOutside: onClickOutsideA } });
        const bLayer = rootLayer.createLayer({ settings: { onClickOutside: onClickOutsideB } });
        rootLayer.element.appendChild(expectQuery(`#root-node`));
        aLayer.element.appendChild(expectQuery(`#layerA-node`));
        bLayer.element.appendChild(expectQuery(`#layerB-node`));
        updateLayers(container, rootLayer, createBackdropParts());

        watchClickOutside(container, rootLayer);

        await click(`#root-node`);

        expect(onClickOutsideA, `catch click on root for layer A`).to.have.callCount(1);
        expect(onClickOutsideB, `catch click on root for layer B`).to.have.callCount(1);

        await click(`#layerA-node`);

        expect(onClickOutsideA, `no dispatch for layerA click`).to.have.callCount(1);
        expect(onClickOutsideB, `catch click on layerA for layerB`).to.have.callCount(2);

        await click(`#layerB-node`);

        expect(onClickOutsideA, `catch click on layerB for layerA`).to.have.callCount(2);
        expect(onClickOutsideB, `no dispatch for layerA click`).to.have.callCount(2);
    });
});
