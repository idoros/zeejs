import { watchFocus, createRoot, createBackdropParts, updateLayers } from '@zeejs/browser';
import { HTMLTestDriver } from './html-test-driver';
import { getInteractionApi } from '@zeejs/test-browser-bridge';
import { expect } from 'chai';
import { stub } from 'sinon';

describe(`focus`, () => {
    let testDriver: HTMLTestDriver;
    const { keyboard, click } = getInteractionApi();

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    it(`should [Tab] navigate through layer`, async () => {
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer>
                    <input id="bgBeforeInput" />
                    <zeejs-origin data-origin="layerX" tabIndex="0">
                    <input id="bgAfterInput" />
                </zeejs-layer>
                <zeejs-layer id="layerX" >
                    <input id="layerInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container, createRoot());

        const bgBeforeInput = expectHTMLQuery(`#bgBeforeInput`);
        const layerInput = expectHTMLQuery(`#layerInput`);
        const bgAfterInput = expectHTMLQuery(`#bgAfterInput`);

        bgBeforeInput.focus();
        expect(document.activeElement, `start focus before layer`).to.equal(bgBeforeInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `focus inside layer`).to.equal(layerInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `focus after layer`).to.equal(bgAfterInput);

        // it would be nice to have native behavior (go to browser chrome)
        // but other layers are in the way of the focus and cannot be skipped
        // without specifically focusing another element or loosing focus.
        await keyboard.press(`Tab`);
        expect(document.activeElement, `back to start`).to.equal(bgBeforeInput);
    });

    it(`should [Shift+Tab] navigate through layer (backwards)`, async () => {
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer>
                    <input id="bgBeforeInput" />
                    <zeejs-origin data-origin="layerX" tabIndex="0">
                    <input id="bgAfterInput" />
                </zeejs-layer>
                <zeejs-layer id="layerX" >
                    <input id="layerInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container, createRoot());

        const bgBeforeInput = expectHTMLQuery(`#bgBeforeInput`);
        const layerInput = expectHTMLQuery(`#layerInput`);
        const bgAfterInput = expectHTMLQuery(`#bgAfterInput`);

        bgAfterInput.focus();
        expect(document.activeElement, `start focus after layer`).to.equal(bgAfterInput);

        await keyboard.press(`Shift+Tab`);
        expect(document.activeElement, `focus inside layer`).to.equal(layerInput);

        await keyboard.press(`Shift+Tab`);
        expect(document.activeElement, `focus before layer`).to.equal(bgBeforeInput);

        await keyboard.press(`Shift+Tab`);
        const activeReturnedToChrome =
            document.activeElement === document.body ||
            document.activeElement === document.body.parentElement || // html in firefox
            // annoying by when tests heedfully with dev tools detached focus will jump back to layer
            // ToDo: add check only when running headless=false
            document.activeElement === layerInput;
        expect(activeReturnedToChrome, `focus on browser chrome`).to.equal(true);
    });

    it(`should [Tab] navigate from layer that is the last tabbable element`, async () => {
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer>
                    <input id="bgBeforeInput" />
                    <zeejs-origin data-origin="layerX" tabIndex="0">
                </zeejs-layer>
                <zeejs-layer id="layerX" >
                    <input id="layerInputA" />
                    <input id="layerInputB" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container, createRoot());

        const bgBeforeInput = expectHTMLQuery(`#bgBeforeInput`);
        const layerInputA = expectHTMLQuery(`#layerInputA`);
        const layerInputB = expectHTMLQuery(`#layerInputB`);

        bgBeforeInput.focus();
        expect(document.activeElement, `start focus before layer`).to.equal(bgBeforeInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `first focus inside layer`).to.equal(layerInputA);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `second focus inside layer`).to.equal(layerInputB);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `back to start`).to.equal(bgBeforeInput);
    });

    it(`should [Shift+Tab] navigate from layer that is the first tabbable element (backwards)`, async () => {
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer>
                    <zeejs-origin data-origin="layerX" tabIndex="0">
                    <input id="bgAfterInput" />
                </zeejs-layer>
                <zeejs-layer id="layerX" >
                    <input id="layerInputA" />
                    <input id="layerInputB" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container, createRoot());

        const bgAfterInput = expectHTMLQuery(`#bgAfterInput`);
        const layerInputA = expectHTMLQuery(`#layerInputA`);
        const layerInputB = expectHTMLQuery(`#layerInputB`);

        bgAfterInput.focus();
        expect(document.activeElement, `start focus after layer`).to.equal(bgAfterInput);

        await keyboard.press(`Shift+Tab`);
        expect(document.activeElement, `second focus inside layer`).to.equal(layerInputB);

        await keyboard.press(`Shift+Tab`);
        expect(document.activeElement, `first focus inside layer`).to.equal(layerInputA);

        await keyboard.press(`Shift+Tab`);
        expect(document.activeElement, `back to start`).to.equal(bgAfterInput);
    });

    it(`should [Tab] into deeply nested layer`, async () => {
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer>
                    <input id="bgBeforeInput" />
                    <zeejs-origin data-origin="layerX" tabIndex="0">
                    <input id="bgAfterInput" />
                </zeejs-layer>
                <zeejs-layer id="layerX" >
                    <zeejs-origin data-origin="layerY" tabIndex="0">
                </zeejs-layer>
                <zeejs-layer id="layerY" >
                    <input id="layerDeepInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container, createRoot());

        const bgBeforeInput = expectHTMLQuery(`#bgBeforeInput`);
        const layerDeepInput = expectHTMLQuery(`#layerDeepInput`);
        const bgAfterInput = expectHTMLQuery(`#bgAfterInput`);

        bgBeforeInput.focus();
        expect(document.activeElement, `start focus before layer`).to.equal(bgBeforeInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `focus inside deep layer`).to.equal(layerDeepInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `focus after layers`).to.equal(bgAfterInput);
    });

    it(`should [Tab] over layer with no tabbable elements`, async () => {
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer>
                    <input id="bgBeforeInput" />
                    <zeejs-origin data-origin="layerX" tabIndex="0">
                    <input id="bgAfterInput" />
                </zeejs-layer>
                <zeejs-layer id="layerX" >
                    <span>no tabbable elements />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container, createRoot());

        const bgBeforeInput = expectHTMLQuery(`#bgBeforeInput`);
        const bgAfterInput = expectHTMLQuery(`#bgAfterInput`);

        bgBeforeInput.focus();
        expect(document.activeElement, `start focus before layer`).to.equal(bgBeforeInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `focus after layer`).to.equal(bgAfterInput);
    });

    it(`should [Tab] skip over missing layer`, async () => {
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer>
                    <input id="bgBeforeInput" />
                    <zeejs-origin data-origin="layerX" tabIndex="0">
                    <input id="bgAfterInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container, createRoot());

        const bgBeforeInput = expectHTMLQuery(`#bgBeforeInput`);
        const bgAfterInput = expectHTMLQuery(`#bgAfterInput`);

        bgBeforeInput.focus();
        expect(document.activeElement, `start focus before layer`).to.equal(bgBeforeInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `focus after layer`).to.equal(bgAfterInput);
    });

    it(`should [Tab] out of edge layer and into first layer`, async () => {
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer>
                    <zeejs-origin data-origin="firstLayer" tabIndex="0">
                    <zeejs-origin data-origin="lastLayer" tabIndex="0">
                </zeejs-layer>
                <zeejs-layer id="firstLayer" >
                    <input id="firstLayerInput" />
                </zeejs-layer>
                <zeejs-layer id="lastLayer" >
                    <input id="lastLayerInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container, createRoot());

        const firstLayerInput = expectHTMLQuery(`#firstLayerInput`);
        const lastLayerInput = expectHTMLQuery(`#lastLayerInput`);

        lastLayerInput.focus();
        expect(document.activeElement, `start in last layer input`).to.equal(lastLayerInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `focus first layer input`).to.equal(firstLayerInput);
    });

    it(`should [Tab] back to input on a single input`, async () => {
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer>
                    <zeejs-origin data-origin="layerX" tabIndex="0">
                </zeejs-layer>
                <zeejs-layer id="layerX" >
                    <input id="layerInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container, createRoot());

        const layerInput = expectHTMLQuery(`#layerInput`);

        layerInput.focus();
        expect(document.activeElement, `start in only input`).to.equal(layerInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `back to start`).to.equal(layerInput);
    });

    it(`should [Tab] trap focus and ignore elements of inert parent layer`, async () => {
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer inert>
                    <input id="bgBeforeInput" />
                    <zeejs-origin data-origin="layerX" tabIndex="0">
                    <input id="bgAfterInput" />
                </zeejs-layer>
                <zeejs-layer id="layerX" >
                    <input id="layerFirstInput" />
                    <input id="layerLastInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container, createRoot());

        const layerFirstInput = expectHTMLQuery(`#layerFirstInput`);
        const layerLastInput = expectHTMLQuery(`#layerLastInput`);

        layerFirstInput.focus();
        expect(document.activeElement, `start focus in layer`).to.equal(layerFirstInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `move to another element in layer`).to.equal(layerLastInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `back to layer start`).to.equal(layerFirstInput);

        await keyboard.press(`Shift+Tab`);
        expect(document.activeElement, `Shift+Tab in layer back to last`).to.equal(layerLastInput);
    });

    it(`should [Tab] trap focus and ignore elements of inert parent layer (multi layers)`, async () => {
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer inert>
                    <input id="bgBeforeInput" />
                    <zeejs-origin data-origin="layerX" tabIndex="0">
                    <input id="bgAfterInput" />
                </zeejs-layer>
                <zeejs-layer id="layerX" >
                    <input id="layerXFirstInput" />
                    <zeejs-origin data-origin="layerY" tabIndex="0">
                    <input id="layerXLastInput" />
                </zeejs-layer>
                <zeejs-layer id="layerY" >
                    <input id="layerYInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container, createRoot());

        const layerXFirstInput = expectHTMLQuery(`#layerXFirstInput`);
        const layerXLastInput = expectHTMLQuery(`#layerXLastInput`);
        const layerYInput = expectHTMLQuery(`#layerYInput`);

        layerXFirstInput.focus();
        expect(document.activeElement, `start focus in layer`).to.equal(layerXFirstInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `move into nested layer`).to.equal(layerYInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `out to layer again`).to.equal(layerXLastInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `rollback ignoring inert parent`).to.equal(layerXFirstInput);

        await keyboard.press(`Shift+Tab`);
        expect(document.activeElement, `Shift+Tab in layer back to last`).to.equal(layerXLastInput);
    });

    it(`should catch focus under inert and pass to first focusable element in a non-inert layer`, () => {
        const inertFocusHandler = stub();
        const { expectHTMLQuery, container } = testDriver.render(
            () => `
            <div>
                <zeejs-layer inert>
                    <input id="firstInertInput" />
                    <zeejs-origin data-origin="layerX" tabIndex="0">
                </zeejs-layer>
                <zeejs-layer id="layerX" >
                    <input id="layerInput" />
                </zeejs-layer>
            </div>
        `
        );
        const firstInertInput = expectHTMLQuery(`#firstInertInput`);
        const layerInput = expectHTMLQuery(`#layerInput`);
        firstInertInput.addEventListener(`focus`, inertFocusHandler);

        watchFocus(container, createRoot());

        firstInertInput.focus();

        expect(document.activeElement, `focus first non inert input`).to.equal(layerInput);
        expect(inertFocusHandler, `inert input shouldn't get called`).callCount(0);
    });

    it(`should inform layer on focus and blur`, async () => {
        const onFocusChange = stub();
        const backdrop = createBackdropParts();
        const { expectQuery, container } = testDriver.render(
            () => `
            <input id="rootInput" />
            <input id="childInput" />
        `
        );
        const rootLayer = createRoot();
        const childLayer = rootLayer.createLayer({ settings: { onFocusChange } });
        rootLayer.element.appendChild(expectQuery(`#rootInput`));
        childLayer.element.appendChild(expectQuery(`#childInput`));
        updateLayers(container, rootLayer, backdrop);

        watchFocus(container, rootLayer);

        expect(rootLayer.state.focusInside, `initial root focus`).to.equal(false);
        expect(childLayer.state.focusInside, `initial child focus`).to.equal(false);

        await click(`#childInput`);

        expect(onFocusChange, `catch focus inside layer`).to.have.callCount(1);
        expect(rootLayer.state.focusInside, `root nested focus`).to.equal(true);
        expect(childLayer.state.focusInside, `child focus`).to.equal(true);

        await click(`#rootInput`);

        expect(onFocusChange, `catch blur outside layer`).to.have.callCount(2);
        expect(rootLayer.state.focusInside, `root focus`).to.equal(true);
        expect(childLayer.state.focusInside, `child blur`).to.equal(false);
    });

    it(`should inform parent layers`, async () => {
        const onFocusChangeParent = stub();
        const onFocusChangeChild = stub();
        const backdrop = createBackdropParts();
        const { expectQuery, container } = testDriver.render(
            () => `
            <input id="rootInput" />
            <input id="parentInput" />
            <input id="childInput" />
        `
        );
        const rootLayer = createRoot();
        const parentLayer = rootLayer.createLayer({
            settings: { onFocusChange: onFocusChangeParent },
        });
        const childLayer = parentLayer.createLayer({
            settings: { onFocusChange: onFocusChangeChild },
        });
        rootLayer.element.appendChild(expectQuery(`#rootInput`));
        parentLayer.element.appendChild(expectQuery(`#parentInput`));
        childLayer.element.appendChild(expectQuery(`#childInput`));
        updateLayers(container, rootLayer, backdrop);

        watchFocus(container, rootLayer);

        expect(rootLayer.state.focusInside, `initial root focus`).to.equal(false);
        expect(parentLayer.state.focusInside, `initial parent focus`).to.equal(false);
        expect(childLayer.state.focusInside, `initial child focus`).to.equal(false);

        await click(`#childInput`);

        expect(onFocusChangeChild, `catch focus inside layer`).to.have.callCount(1);
        expect(onFocusChangeParent, `catch focus inside parent`).to.have.callCount(1);
        expect(childLayer.state.focusInside, `child focus`).to.equal(true);
        expect(parentLayer.state.focusInside, `parent focus`).to.equal(true);
        expect(rootLayer.state.focusInside, `root nested focus`).to.equal(true);

        await click(`#parentInput`);

        expect(onFocusChangeChild, `catch blur outside layer`).to.have.callCount(2);
        expect(onFocusChangeParent, `no change for parent`).to.have.callCount(1);
        expect(childLayer.state.focusInside, `child blur`).to.equal(false);
        expect(parentLayer.state.focusInside, `parent direct focus`).to.equal(true);
        expect(rootLayer.state.focusInside, `root still focus`).to.equal(true);

        await click(`#rootInput`);

        expect(onFocusChangeChild, `no change for layer`).to.have.callCount(2);
        expect(onFocusChangeParent, `catch blur for parent`).to.have.callCount(2);
        expect(childLayer.state.focusInside, `child still blur`).to.equal(false);
        expect(parentLayer.state.focusInside, `parent now blur`).to.equal(false);
        expect(rootLayer.state.focusInside, `root direct focus`).to.equal(true);
    });

    it(`should not inform common parent between nested layers`, async () => {
        const onFocusChange = stub();
        const backdrop = createBackdropParts();
        const { expectQuery, container } = testDriver.render(
            () => `
            <input id="rootInput" />
            <input id="parentInput" />
            <input id="childAInput" />
            <input id="childBInput" />
        `
        );
        const rootLayer = createRoot();
        const parentLayer = rootLayer.createLayer({
            settings: { onFocusChange },
        });
        const childALayer = parentLayer.createLayer();
        const childBLayer = parentLayer.createLayer();
        rootLayer.element.appendChild(expectQuery(`#rootInput`));
        parentLayer.element.appendChild(expectQuery(`#parentInput`));
        childALayer.element.appendChild(expectQuery(`#childAInput`));
        childBLayer.element.appendChild(expectQuery(`#childBInput`));
        updateLayers(container, rootLayer, backdrop);

        watchFocus(container, rootLayer);

        await click(`#childAInput`);

        expect(onFocusChange, `catch nested focus inside parent`).to.have.callCount(1);
        expect(childALayer.state.focusInside, `focus inside layer A`).to.equal(true);
        expect(childBLayer.state.focusInside, `focus not inside layer B`).to.equal(false);
        expect(parentLayer.state.focusInside, `focus nested in parent`).to.equal(true);

        await click(`#childBInput`);

        expect(onFocusChange, `no focus change inside parent`).to.have.callCount(1);
        expect(childALayer.state.focusInside, `focus not inside layer A`).to.equal(false);
        expect(childBLayer.state.focusInside, `focus not inside layer B`).to.equal(true);
        expect(parentLayer.state.focusInside, `focus still nested in parent`).to.equal(true);
    });
});
