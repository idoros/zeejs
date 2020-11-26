import { popover, css } from '../src';
import { HTMLTestDriver } from './html-test-driver';
import { expect } from 'chai';
import { waitFor } from 'promise-assist';

describe(`popover`, () => {
    let testDriver: HTMLTestDriver;

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    describe(`display`, () => {
        it(`should be hidden until overlay is positioned`, () => {
            const { open, close, overlayCSSClass } = popover();
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <style>
                    ${css}
                    #overlayInner {
                        visibility: visible;
                    }
                </style>
                <div style="height: 100vh; display: grid; align-items: center; justify-content: center;">
                    <button id="anchor" style="width: 30px; height: 30px;">anchor</button>
                </div>
                <span id="overlay" class="${overlayCSSClass()}">
                    <span id="overlayInner">overlay</span>
                </span>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const overlay = expectHTMLQuery(`#overlay`);
            const overlayInner = expectHTMLQuery(`#overlayInner`);

            expect(getComputedStyle(overlay).visibility, `overlay hidden before`).to.equal(
                `hidden`
            );
            expect(
                getComputedStyle(overlayInner).visibility,
                `overlay inner hidden before`
            ).to.equal(`hidden`);

            open({
                anchor,
                overlay,
            });

            expect(getComputedStyle(overlay).visibility, `overlay visible when opened`).to.equal(
                `visible`
            );
            expect(
                getComputedStyle(overlayInner).visibility,
                `overlay inner visible when opened`
            ).to.equal(`visible`);

            close();

            expect(getComputedStyle(overlay).visibility, `overlay hidden before`).to.equal(
                `hidden`
            );
            expect(
                getComputedStyle(overlayInner).visibility,
                `overlay inner hidden before`
            ).to.equal(`hidden`);
        });
        it(`should append custom CSS class to the overlay element`, () => {
            const { open, close, overlayCSSClass } = popover();
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <style>
                    ${css}
                    #overlayInner {
                        visibility: visible;
                    }
                    .customBg {
                        outline: 2px solid green;
                    }
                    .customBg2 {
                        outline: 5px solid green;
                    }
                </style>
                <div style="height: 100vh; display: grid; align-items: center; justify-content: center;">
                    <button id="anchor" style="width: 30px; height: 30px;">anchor</button>
                </div>
                <span id="overlay" class="${overlayCSSClass('customBg')}">
                    <span id="overlayInner">overlay</span>
                </span>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const overlay = expectHTMLQuery(`#overlay`);

            expect(getComputedStyle(overlay).outlineWidth, `initial`).to.equal(`2px`);

            open({
                anchor,
                overlay,
            });

            expect(getComputedStyle(overlay).outlineWidth, `after open`).to.equal(`2px`);

            close();

            expect(getComputedStyle(overlay).outlineWidth, `after close`).to.equal(`2px`);

            overlay.className = overlayCSSClass(`customBg2`);

            expect(getComputedStyle(overlay).outlineWidth, `replaced`).to.equal(`5px`);

            open({
                anchor,
                overlay,
            });

            expect(getComputedStyle(overlay).outlineWidth, `replaced after open`).to.equal(`5px`);

            close();

            expect(getComputedStyle(overlay).outlineWidth, `replaced after close`).to.equal(`5px`);
        });
    });
    describe(`position`, () => {
        it(`should keep position centered below anchor by default`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <div style="height: 100vh; display: grid; align-items: center; justify-content: center;">
                    <button id="anchor" style="width: 30px; height: 30px;">anchor</button>
                </div>
                <span id="overlay">overlay</span>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const { open } = popover();

            open({
                anchor,
                overlay,
            });

            await waitFor(() => {
                const anchorRect = anchor.getBoundingClientRect();
                const overlayRect = overlay.getBoundingClientRect();
                expect(Math.round(overlayRect.top), `below`).to.equal(anchorRect.bottom);
                expect(
                    Math.round(overlayRect.left + overlayRect.width / 2),
                    `centered`
                ).to.be.approximately(Math.round(anchorRect.left + anchorRect.width / 2), 1);
            });
        });
        it(`should set custom position`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <div style="height: 100vh; display: grid; align-items: center; justify-content: center;">
                    <button id="anchor" style="width: 30px; height: 30px;">anchor</button>
                </div>
                <span id="overlay">overlay</span>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const overlay = expectHTMLQuery(`#overlay`);
            const { open } = popover();

            open(
                {
                    anchor,
                    overlay,
                },
                {
                    positionX: `after`,
                    positionY: `after`,
                }
            );

            await waitFor(() => {
                const anchorRect = anchor.getBoundingClientRect();
                const overlayRect = overlay.getBoundingClientRect();
                expect(overlayRect.top, `below`).to.equal(anchorRect.bottom);
                expect(overlayRect.left, `right of`).to.equal(anchorRect.right);
            });
        });
        it(`should update relative position`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <div style="height: 100vh; display: grid; align-items: center; justify-content: center;">
                    <button id="anchor" style="width: 30px; height: 30px;">anchor</button>
                </div>
                <span id="overlay">overlay</span>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const overlay = expectHTMLQuery(`#overlay`);
            const { open, updateOptions } = popover();
            open(
                {
                    anchor,
                    overlay,
                },
                {
                    positionX: `after`,
                    positionY: `after`,
                }
            );

            updateOptions({
                positionX: `before`,
                positionY: `before`,
            });

            await waitFor(() => {
                const anchorRect = anchor.getBoundingClientRect();
                const overlayRect = overlay.getBoundingClientRect();
                expect(overlayRect.bottom, `above`).to.be.approximately(anchorRect.top, 0.5);
                expect(overlayRect.right, `left of`).to.be.approximately(anchorRect.left, 0.5);
            });
        });
        it(`should cover anchor while keeping in view (default)`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <div id="anchor" style="width: 100px; height: 40px; position: fixed; bottom: 0; right: 0; background: red;"></div>
                <div id="overlay" style="width: 80px; height: 20px; background: green;"></div>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { open } = popover();
            open(
                {
                    anchor,
                    overlay,
                },
                {
                    positionX: `after`,
                    positionY: `after`,
                }
            );

            await waitFor(() => {
                const popoverNode = expectHTMLQuery(`#overlay`);
                const parentNode = expectHTMLQuery(`#anchor`);
                const popoverBounds = popoverNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(popoverBounds.bottom, `popover bottom`).to.equal(parentBounds.bottom);
                expect(popoverBounds.right, `popover right`).to.equal(parentBounds.right);
            });
        });
        it(`should optionally avoid anchor in case of overflow`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <div id="anchor" style="width: 100px; height: 40px; position: fixed; bottom: 0; right: 0; background: red;"></div>
                <div id="overlay" style="width: 80px; height: 20px; background: green;"></div>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { open } = popover();
            open(
                {
                    anchor,
                    overlay,
                },
                {
                    positionX: `after`,
                    positionY: `after`,
                    avoidAnchor: true,
                }
            );

            await waitFor(() => {
                const popoverNode = expectHTMLQuery(`#overlay`);
                const parentNode = expectHTMLQuery(`#anchor`);
                const popoverBounds = popoverNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(popoverBounds.right, `popover pushed on x`).to.equal(parentBounds.right);
                expect(popoverBounds.bottom, `popover flipped on y`).to.equal(parentBounds.top);
            });
        });
        it(`should switch between avoid anchor modes`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <div id="anchor" style="width: 100px; height: 40px; position: fixed; bottom: 0; right: 0; background: red;"></div>
                <div id="overlay" style="width: 80px; height: 20px; background: green;"></div>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { open, updateOptions } = popover();
            open(
                {
                    anchor,
                    overlay,
                },
                {
                    positionX: `after`,
                    positionY: `after`,
                    avoidAnchor: true,
                }
            );

            await waitFor(() => {
                const popoverNode = expectHTMLQuery(`#overlay`);
                const parentNode = expectHTMLQuery(`#anchor`);
                const popoverBounds = popoverNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(popoverBounds.right, `popover pushed on x`).to.equal(parentBounds.right);
                expect(popoverBounds.bottom, `popover flipped on y`).to.equal(parentBounds.top);
            });

            updateOptions({ avoidAnchor: false });

            await waitFor(() => {
                const popoverNode = expectHTMLQuery(`#overlay`);
                const parentNode = expectHTMLQuery(`#anchor`);
                const popoverBounds = popoverNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(popoverBounds.bottom, `popover bottom`).to.equal(parentBounds.bottom);
                expect(popoverBounds.right, `popover right`).to.equal(parentBounds.right);
            });
        });
    });
    describe(`size`, () => {
        it(`should keep original by default`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 200px; height: 50px;">anchor</button>
                <span id="overlay" style="width: 300px; height: 30px;">overlay</span>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const { open } = popover();

            open({
                anchor,
                overlay,
            });

            const overlayRect = overlay.getBoundingClientRect();
            expect(overlayRect.width, `width`).to.equal(300);
            expect(overlayRect.height, `height`).to.equal(30);
        });
        it(`should match anchor size`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 200px; height: 50px;">anchor</button>
                <span id="overlay" style="width: 300px; height: 30px;">overlay</span>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const { open, close } = popover();

            open(
                {
                    anchor,
                    overlay,
                },
                {
                    matchWidth: true,
                    matchHeight: true,
                }
            );

            let overlayRect = overlay.getBoundingClientRect();
            expect(overlayRect.width, `width`).to.equal(200);
            expect(overlayRect.height, `height`).to.equal(50);

            close();

            overlayRect = overlay.getBoundingClientRect();
            expect(overlayRect.width, `width restored`).to.equal(300);
            expect(overlayRect.height, `height restored`).to.equal(30);
        });
        it(`should update size on prop change`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 200px; height: 50px;">anchor</button>
                <span id="overlay" style="width: 300px; height: 30px;">overlay</span>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const { open, updateOptions } = popover();

            open(
                {
                    anchor,
                    overlay,
                },
                {
                    matchWidth: true,
                    matchHeight: true,
                }
            );

            let overlayRect = overlay.getBoundingClientRect();
            expect(overlayRect.width, `width`).to.equal(200);
            expect(overlayRect.height, `height`).to.equal(50);

            updateOptions({
                matchWidth: false,
                matchHeight: true,
            });

            await waitFor(() => {
                overlayRect = overlay.getBoundingClientRect();
                expect(overlayRect.width, `width not restricted`).to.equal(300);
                expect(overlayRect.height, `height still restricted`).to.equal(50);
            });
            updateOptions({
                matchWidth: true,
                matchHeight: false,
            });

            await waitFor(() => {
                overlayRect = overlay.getBoundingClientRect();
                expect(overlayRect.width, `width restricted again`).to.equal(200);
                expect(overlayRect.height, `height not restricted`).to.equal(30);
            });
        });
    });
});
