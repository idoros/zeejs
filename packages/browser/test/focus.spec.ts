import { watchFocus } from '../src';
import { HTMLTestDriver } from './html-test-driver';
import { getInteractionApi } from '@zeejs/test-browser/browser';
import { expect } from 'chai';

describe(`focus`, () => {
    let testDriver: HTMLTestDriver;
    const { keyboard } = getInteractionApi();

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
                <zeejs-layer data-id="layerX" >
                    <input id="layerInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container);

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
                <zeejs-layer data-id="layerX" >
                    <input id="layerInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container);

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
            document.activeElement === document.body.parentElement; // html in firefox
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
                <zeejs-layer data-id="layerX" >
                    <input id="layerInputA" />
                    <input id="layerInputB" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container);

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
                <zeejs-layer data-id="layerX" >
                    <input id="layerInputA" />
                    <input id="layerInputB" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container);

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
                <zeejs-layer data-id="layerX" >
                    <zeejs-origin data-origin="layerY" tabIndex="0">
                </zeejs-layer>
                <zeejs-layer data-id="layerY" >
                    <input id="layerDeepInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container);

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
                <zeejs-layer data-id="layerX" >
                    <span>no tabbable elements />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container);

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
        watchFocus(container);

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
                <zeejs-layer data-id="firstLayer" >
                    <input id="firstLayerInput" />
                </zeejs-layer>
                <zeejs-layer data-id="lastLayer" >
                    <input id="lastLayerInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container);

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
                <zeejs-layer data-id="layerX" >
                    <input id="layerInput" />
                </zeejs-layer>
            </div>
        `
        );
        watchFocus(container);

        const layerInput = expectHTMLQuery(`#layerInput`);

        layerInput.focus();
        expect(document.activeElement, `start in only input`).to.equal(layerInput);

        await keyboard.press(`Tab`);
        expect(document.activeElement, `back to start`).to.equal(layerInput);
    });
});
