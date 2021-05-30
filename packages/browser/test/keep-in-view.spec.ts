import { expect } from 'chai';
import { keepInView } from '@zeejs/browser';
import { HTMLTestDriver } from './html-test-driver';

describe(`keep-in-view`, () => {
    let testDriver: HTMLTestDriver;

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    function getBounds(element: HTMLElement): Parameters<typeof keepInView>[1]['anchorBounds'] {
        return element.getBoundingClientRect();
    }
    function getViewportSize() {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
        };
    }

    it(`should do nothing for overlay within viewport`, () => {
        const { expectHTMLQuery } = testDriver.render(
            () => `
                <style>
                    #anchor {
                        position: absolute; background: blue;
                        top: 40vh; left: 40vw; 
                        width: 20vw; height: 20vh;
                    }
                    #overlay {
                        position: absolute; background: blue;
                        top: 60vh; left: 40vw; 
                        width: 20vw; height: 20vh;"
                    }
                </style>
                <div id="anchor"></div> 
                <div id="overlay"></div> 
            `
        );
        const anchor = expectHTMLQuery(`#anchor`);
        const overlay = expectHTMLQuery(`#overlay`);

        keepInView(
            { avoidAnchor: true },
            {
                anchorBounds: getBounds(anchor),
                overlayBounds: getBounds(overlay),
                overlay,
                viewport: getViewportSize(),
            }
        );

        expect(overlay.style.left, 'left untouched').to.equal(``);
        expect(overlay.style.top, 'top untouched').to.equal(``);
    });

    describe(`avoid anchor`, () => {
        it(`should flip into view around anchor for overlap on other direction`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                    <style>
                        #anchor {
                            position: absolute; background: blue;
                            top: 40vh; left: 80vw; 
                            width: 20vw; height: 20vh;
                        }
                        #overlay {
                            position: absolute; background: blue;
                            top: 40vh; left: 100vw; 
                            width: 20vw; height: 20vh;"
                        }
                    </style>
                    <div id="anchor"></div> 
                    <div id="overlay"></div> 
                `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const anchorBounds = getBounds(anchor);
            const overlayBounds = getBounds(overlay);

            keepInView(
                { avoidAnchor: true },
                {
                    anchorBounds,
                    overlayBounds,
                    overlay,
                    viewport: getViewportSize(),
                }
            );

            expect(overlay.style.left, 'left flipped').to.equal(
                anchorBounds.x - overlayBounds.width + `px`
            );
            expect(overlay.style.top, 'top untouched').to.equal(``);
        });

        it(`should stick in view for no overlap on other direction`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                    <style>
                        #anchor {
                            position: absolute; background: blue;
                            top: 40vh; left: 80vw; 
                            width: 20vw; height: 20vh;
                        }
                        #overlay {
                            position: absolute; background: blue;
                            top: 60vh; left: 100vw; 
                            width: 20vw; height: 20vh;"
                        }
                    </style>
                    <div id="anchor"></div> 
                    <div id="overlay"></div> 
                `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const anchorBounds = getBounds(anchor);
            const overlayBounds = getBounds(overlay);
            const viewport = getViewportSize();

            keepInView(
                { avoidAnchor: true },
                {
                    anchorBounds,
                    overlayBounds,
                    overlay,
                    viewport,
                }
            );

            expect(overlay.style.left, 'left stick in view').to.equal(
                viewport.width - overlayBounds.width + `px`
            );
            expect(overlay.style.top, 'top untouched').to.equal(``);
        });

        it(`should stick in view for both direction direction (calculate x first)`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <style>
                    #anchor {
                        position: absolute; background: blue;
                        top: 80vh; left: 80vw; 
                        width: 20vw; height: 20vh;
                    }
                    #overlay {
                        position: absolute; background: blue;
                        top: 100vh; left: 100vw; 
                        width: 20vw; height: 20vh;"
                    }
                </style>
                <div id="anchor"></div> 
                <div id="overlay"></div> 
            `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const anchorBounds = getBounds(anchor);
            const overlayBounds = getBounds(overlay);
            const viewport = getViewportSize();

            keepInView(
                { avoidAnchor: true },
                {
                    anchorBounds,
                    overlayBounds,
                    overlay,
                    viewport,
                }
            );

            expect(overlay.style.left, 'left sticked in view').to.equal(
                viewport.width - overlayBounds.width + `px`
            );
            expect(overlay.style.top, 'top flipped').to.equal(
                anchorBounds.y - overlayBounds.height + `px`
            );
        });
    });
    describe(`cover anchor`, () => {
        it(`should stick in view covering anchor`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                    <style>
                        #anchor {
                            position: absolute; background: blue;
                            top: 80vh; left: 80vw; 
                            width: 20vw; height: 20vh;
                        }
                        #overlay {
                            position: absolute; background: blue;
                            top: 100vh; left: 100vw; 
                            width: 20vw; height: 20vh;"
                        }
                    </style>
                    <div id="anchor"></div> 
                    <div id="overlay"></div> 
                `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const anchorBounds = getBounds(anchor);
            const overlayBounds = getBounds(overlay);
            const viewport = getViewportSize();

            keepInView(
                { avoidAnchor: false },
                {
                    anchorBounds,
                    overlayBounds,
                    overlay,
                    viewport,
                }
            );

            expect(overlay.style.left, 'left cover').to.equal(
                viewport.width - overlayBounds.width + `px`
            );
            expect(overlay.style.top, 'top cover').to.equal(
                viewport.height - overlayBounds.height + `px`
            );
        });
    });
});
