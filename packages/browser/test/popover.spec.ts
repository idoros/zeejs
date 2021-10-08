import { popover } from '@zeejs/browser';
import { HTMLTestDriver } from './html-test-driver';
import { expect } from 'chai';
import { waitFor } from 'promise-assist';

describe.only(`popover`, () => {
    let testDriver: HTMLTestDriver;

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

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
});
