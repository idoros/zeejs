import { watchMouseInside, createRoot, updateLayers, createBackdropParts, css } from '@zeejs/browser';
import { HTMLTestDriver } from './html-test-driver';
import { getInteractionApi } from '@zeejs/test-browser-bridge';
import chai, { expect } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
import { waitFor } from 'promise-assist';
chai.use(sinonChai);

describe(`mouse-inside`, () => {
    let testDriver: HTMLTestDriver;
    const { hover } = getInteractionApi();

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    it(`should inform layer when mouse enters and leaves`, async () => {
        const onMouseIntersection = stub();
        const backdrop = createBackdropParts();
        const { container, expectQuery } = testDriver.render(
            () => `
            <div id="root-node" style="width: 50px; height: 50px;"></div>
            <div id="child-node" style="width: 50px; height: 50px;"></div>
        `
        );
        const rootLayer = createRoot();
        const childLayer = rootLayer.createLayer({ settings: { onMouseIntersection } });
        rootLayer.element.appendChild(expectQuery(`#root-node`));
        childLayer.element.appendChild(expectQuery(`#child-node`));
        updateLayers(container, rootLayer, backdrop);

        watchMouseInside(container, rootLayer, backdrop);

        await hover(`#child-node`);

        await waitFor(() => {
            expect(onMouseIntersection, `catch mouse inside layer`).to.have.callCount(1);
            expect(childLayer.state, `mouse in child layer`).to.contains({
                mouseInside: true,
            });
        });

        await hover(`#root-node`);

        await waitFor(() => {
            expect(onMouseIntersection, `catch mouse outside layer`).to.have.callCount(2);
            expect(childLayer.state, `mouse out of child layer`).to.contains({
                mouseInside: false,
            });
        });
    });

    it(`should inform parent layers`, async () => {
        const onMouseIntersectionParent = stub();
        const onMouseIntersectionChild = stub();
        const backdrop = createBackdropParts();
        const { container, expectQuery } = testDriver.render(
            () => `
            <div id="root-node" style="width: !00px; height: 100px;"></div>
            <div id="parent-node" style="width: 50px; height: 50px;"></div>
            <div id="child-node" style="width: 25px; height: 25px;"></div>
        `
        );
        const rootLayer = createRoot();
        const parentLayer = rootLayer.createLayer({
            settings: { onMouseIntersection: onMouseIntersectionParent },
        });
        const childLayer = parentLayer.createLayer({
            settings: { onMouseIntersection: onMouseIntersectionChild },
        });
        rootLayer.element.appendChild(expectQuery(`#root-node`));
        parentLayer.element.appendChild(expectQuery(`#parent-node`));
        childLayer.element.appendChild(expectQuery(`#child-node`));
        updateLayers(container, rootLayer, backdrop);

        watchMouseInside(container, rootLayer, backdrop);

        await hover(`#child-node`);

        await waitFor(() => {
            expect(onMouseIntersectionChild, `catch mouse inside layer`).to.have.callCount(1);
            expect(onMouseIntersectionParent, `catch mouse inside parent`).to.have.callCount(1);
            expect(childLayer.state, `mouse in layer`).to.contains({
                mouseInside: true,
            });
            expect(parentLayer.state, `mouse in parent layer`).to.contains({
                mouseInside: true,
            });
            expect(rootLayer.state, `mouse in root`).to.contains({
                mouseInside: true,
            });
        });

        await hover(`#parent-node`);

        await waitFor(() => {
            expect(onMouseIntersectionChild, `catch mouse outside layer`).to.have.callCount(2);
            expect(onMouseIntersectionParent, `no mouse change inside parent`).to.have.callCount(1);
            expect(childLayer.state, `mouse in layer`).to.contains({
                mouseInside: false,
            });
            expect(parentLayer.state, `mouse in parent layer`).to.contains({
                mouseInside: true,
            });
            expect(rootLayer.state, `mouse in root`).to.contains({
                mouseInside: true,
            });
        });

        await hover(`#root-node`);

        await waitFor(() => {
            expect(onMouseIntersectionChild, `no mouse change in layer`).to.have.callCount(2);
            expect(onMouseIntersectionParent, `catch mouse outside parent`).to.have.callCount(2);
            expect(childLayer.state, `mouse in layer`).to.contains({
                mouseInside: false,
            });
            expect(parentLayer.state, `mouse in parent layer`).to.contains({
                mouseInside: false,
            });
            expect(rootLayer.state, `mouse in root`).to.contains({
                mouseInside: true,
            });
        });
    });

    it(`should not inform common parent between nested layers`, async () => {
        const onMouseIntersectionParent = stub();
        const backdrop = createBackdropParts();
        const { container, expectQuery } = testDriver.render(
            () => `
            <div id="root-node" style="width: !00px; height: 100px;"></div>
            <div id="parent-node" style="width: 50px; height: 50px;"></div>
            <div id="childA-node" style="width: 25px; height: 25px;"></div>
            <div id="childB-node" style="width: 25px; height: 25px;"></div>
        `
        );
        const rootLayer = createRoot();
        const parentLayer = rootLayer.createLayer({
            settings: { onMouseIntersection: onMouseIntersectionParent },
        });
        const childALayer = parentLayer.createLayer();
        const childBLayer = parentLayer.createLayer();
        rootLayer.element.appendChild(expectQuery(`#root-node`));
        parentLayer.element.appendChild(expectQuery(`#parent-node`));
        childALayer.element.appendChild(expectQuery(`#childA-node`));
        childBLayer.element.appendChild(expectQuery(`#childB-node`));
        updateLayers(container, rootLayer, backdrop);

        watchMouseInside(container, rootLayer, backdrop);

        await hover(`#childA-node`);

        await waitFor(() => {
            expect(onMouseIntersectionParent, `catch mouse inside parent`).to.have.callCount(1);
            expect(childALayer.state, `mouse in layer A`).to.contains({
                mouseInside: true,
            });
            expect(childBLayer.state, `mouse not in layer B`).to.contains({
                mouseInside: false,
            });
            expect(parentLayer.state, `mouse in parent layer`).to.contains({
                mouseInside: true,
            });
        });

        await hover(`#childB-node`);

        await waitFor(() => {
            expect(onMouseIntersectionParent, `no mouse change inside parent`).to.have.callCount(1);
            expect(childALayer.state, `mouse not in layer A`).to.contains({
                mouseInside: false,
            });
            expect(childBLayer.state, `mouse in layer B`).to.contains({
                mouseInside: true,
            });
            expect(parentLayer.state, `mouse in parent layer`).to.contains({
                mouseInside: true,
            });
        });
    });

    it(`should consider backdrop as part of parent layer`, async () => {
        const onMouseIntersectionParent = stub();
        const onMouseIntersectionChild = stub();
        const backdrop = createBackdropParts();
        const { container, expectQuery } = testDriver.render(
            () => `
            <style id="style">${css}</style>
            <div id="root-node" style="width: !00px; height: 100px;"></div>
            <div id="parent-node" style="width: 50px; height: 50px;"></div>
            <div id="child-node" style="width: 25px; height: 25px;"></div>
            `
        );
        backdrop.block.id = `backdrop`;
        const rootLayer = createRoot();
        const parentLayer = rootLayer.createLayer({
            settings: { onMouseIntersection: onMouseIntersectionParent },
        });
        const childLayer = parentLayer.createLayer({
            settings: {
                onMouseIntersection: onMouseIntersectionChild,
                backdrop: `block`,
            },
        });
        rootLayer.element.appendChild(expectQuery(`#root-node`));
        rootLayer.element.appendChild(expectQuery(`#style`));
        parentLayer.element.appendChild(expectQuery(`#parent-node`));
        childLayer.element.appendChild(expectQuery(`#child-node`));
        updateLayers(container, rootLayer, backdrop);

        watchMouseInside(container, rootLayer, backdrop);

        await hover(`#child-node`);

        await waitFor(() => {
            expect(onMouseIntersectionChild, `catch mouse inside layer`).to.have.callCount(1);
            expect(onMouseIntersectionParent, `catch mouse inside parent`).to.have.callCount(1);
            expect(childLayer.state, `mouse in layer`).to.contains({
                mouseInside: true,
            });
            expect(parentLayer.state, `mouse in parent`).to.contains({
                mouseInside: true,
            });
        });

        await hover(`#backdrop`);

        await waitFor(() => {
            expect(onMouseIntersectionChild, `catch mouse change outside layer`).to.have.callCount(
                2
            );
            expect(onMouseIntersectionParent, `no mouse change inside parent`).to.have.callCount(1);
            expect(childLayer.state, `backdrop is outside of layer`).to.contains({
                mouseInside: false,
            });
            expect(parentLayer.state, `backdrop is inside parent`).to.contains({
                mouseInside: true,
            });
        });
    });
});
