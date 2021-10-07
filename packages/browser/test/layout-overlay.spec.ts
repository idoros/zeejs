import { layoutOverlay, OverlayPosition } from '@zeejs/browser';
import { HTMLTestDriver } from './html-test-driver';
import { getInteractionApi } from '@zeejs/test-browser-bridge';
import chai, { expect } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
import { waitFor, sleep } from 'promise-assist';
chai.use(sinonChai);

describe(`layout-overlay`, () => {
    let testDriver: HTMLTestDriver;
    const { viewportSize, setViewportSize } = getInteractionApi();

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    describe(`track position & size`, () => {
        it(`should overlay according to anchor initial position and size`, () => {
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => `
                    <div id="anchor" style="background: red;width: 100px; height: 200px; margin: 30px"></div>
                    <div id="overlay" style="background:green;"/>
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { stop } = layoutOverlay(anchor, overlay);

            expect(overlay.getBoundingClientRect(), `position and size sync`).to.eql(
                anchor.getBoundingClientRect()
            );

            stop();
        });
        it(`should set overlay position accounting for global offset`, () => {
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => ` 
                    <div id="anchor" style="width: 100px; height: 200px; margin: 35px; outline: 1px solid red;"></div> 
                    <div id="offsetParent" style="position: relative; float: right; top: 666px; left: 22; margin: 50px; padding: 30px; outline: 1px solid pink;"> 
                        <div id="overlay" style="outline: 1px solid green;"></div> 
                    </div> 
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { stop } = layoutOverlay(anchor, overlay);

            expect(overlay.getBoundingClientRect(), `position and size sync`).to.eql(
                anchor.getBoundingClientRect()
            );

            stop();
        });
        it(`should update overlay size on anchor change`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => ` 
                    <div id="anchor" style="width: 100px; height: 200px; margin: 30px"></div> 
                    <div id="overlay" /> 
                `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { stop } = layoutOverlay(anchor, overlay);

            anchor.style.width = `250px`;

            await waitFor(() => {
                expect(overlay.getBoundingClientRect(), `size sync`).to.eql(
                    anchor.getBoundingClientRect()
                );
            });

            stop();
        });
        it(`should update on overlay size change`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => ` 
                    <div id="anchor" style="width: 100px; height: 200px; position: fixed;outline: 1px solid red;"></div> 
                    <div id="overlay" style="width: 60px; height: 100px;outline: 1px solid green;" /> 
                `
            );
            const anchor = expectHTMLQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { stop } = layoutOverlay(anchor, overlay, {
                height: false,
                width: false,
                x: `center`,
                y: `center`,
            });
            await sleep(10); // wait for initial observe to be called

            await waitFor(() => {
                const overlayBounds = overlay.getBoundingClientRect();
                expect(overlayBounds.x, `initial x position`).to.equal(20);
                expect(overlayBounds.y, `initial y position`).to.equal(50);
            });
            overlay.style.width = `40px`;
            overlay.style.height = `80px`;

            await waitFor(() => {
                const overlayBounds = overlay.getBoundingClientRect();
                expect(overlayBounds.x, `sync x position`).to.equal(30);
                expect(overlayBounds.y, `sync y position`).to.equal(60);
            });

            stop();
        });
        it(`should update overlay position on scroll`, async () => {
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => ` 
                    <div id="box" style="height: 100px; overflow: scroll;"> 
                        <div id="anchor" style="width: 100px; height: 200px; margin: 30px"></div> 
                    </div> 
                    <div id="overlay" /> 
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const { stop } = layoutOverlay(anchor, overlay);

            expectQuery(`#box`).scrollTop = 100;

            await waitFor(() => {
                expect(overlay.getBoundingClientRect()).to.eql(anchor.getBoundingClientRect());
            });

            stop();
        });
        it(`should update overlay on window resize`, async () => {
            const initSize = await viewportSize();
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => ` 
                    <div id="anchor" style="width: 50vw; height: 50vh;"></div> 
                    <div id="overlay"></div> 
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const { stop } = layoutOverlay(anchor, overlay);

            await setViewportSize({ width: 300, height: 300 });

            await waitFor(() => {
                expect(overlay.getBoundingClientRect(), `position and size sync`).to.contain({
                    width: 150,
                    height: 150,
                });
            });

            stop();
            if (initSize) {
                await setViewportSize(initSize);
            } else {
                throw new Error(`expected test to run in a set viewport env`);
            }
        });
        it(`should update overlay position relative to another overlay`, async () => {
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => ` 
                    <div id="box" style="height: 100px; overflow: scroll;"> 
                        <div id="anchor" style="width: 100px; height: 300px; margin: 30px"></div> 
                    </div> 
                    <div id="overlayA"></div> 
                    <div id="overlayB"></div> 
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlayA = expectHTMLQuery(`#overlayA`);
            const overlayB = expectHTMLQuery(`#overlayB`);
            const { stop: stopA } = layoutOverlay(anchor, overlayA);
            const { stop: stopB } = layoutOverlay(overlayA, overlayB);

            expectQuery(`#box`).scrollTop = 100;

            await waitFor(() => {
                expect(overlayA.getBoundingClientRect(), `sync A`).to.eql(
                    anchor.getBoundingClientRect()
                );
                expect(overlayB.getBoundingClientRect(), `sync B`).to.eql(
                    anchor.getBoundingClientRect()
                );
            });

            expectQuery(`#box`).scrollTop = 80;

            await waitFor(() => {
                expect(overlayA.getBoundingClientRect(), `sync (2) A`).to.eql(
                    anchor.getBoundingClientRect()
                );
                expect(overlayB.getBoundingClientRect(), `sync (2) B`).to.eql(
                    anchor.getBoundingClientRect()
                );
            });

            stopA();
            stopB();
        });
        it(`should restrict overlay size when bound to anchor size`, () => {
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => `
                    <div id="anchor" style="background: red;width: 100px; height: 200px; margin: 30px"></div>
                    <div id="overlay" style="background:green; overflow-y: visible;">
                        <div style="width: 300px; height: 300px;"></div>
                    </div>
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { stop } = layoutOverlay(anchor, overlay);

            expect(overlay.style.overflowX, `overflow-x`).to.equal(`auto`);
            expect(overlay.style.overflowY, `overflow-y`).to.equal(`auto`);

            stop();

            expect(overlay.style.overflowX, `initial overflow-x`).to.equal(``);
            expect(overlay.style.overflowY, `initial overflow-y`).to.equal(`visible`);
        });
        it(`should restore size when stopped`, () => {
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => `
                    <div id="anchor" style="background: red;width: 100px; height: 200px; margin: 30px"></div>
                    <div id="overlay" style="background:green;"/>
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            let { stop } = layoutOverlay(anchor, overlay);

            stop();

            expect(overlay.style.width, `unset width`).to.equal(``);
            expect(overlay.style.height, `unset height`).to.equal(``);

            overlay.style.width = `300px`;
            overlay.style.height = `400px`;

            ({ stop } = layoutOverlay(anchor, overlay));

            stop();

            expect(overlay.style.width, `initial width`).to.equal(`300px`);
            expect(overlay.style.height, `initial height`).to.equal(`400px`);
        });
        describe(`document scroll`, () => {
            it(`should update overlay position relative to body`, async () => {
                const { expectQuery, expectHTMLQuery } = testDriver.render(
                    () => ` 
                        <div id="expander" style="height: 300px;"></div> 
                        <div id="reference" style="outline: 1px solid red;width: 100px; height: 200px; margin: 30px"></div> 
                        <div id="expander" style="height: 200vh;"></div> 
                        <div id="endElement"></div> 
                        <div id="overlay" style="outline: 1px solid green;"></div> 
                    `
                );
                const reference = expectQuery(`#reference`);
                const overlay = expectHTMLQuery(`#overlay`);
                const endElement = expectHTMLQuery(`#endElement`);
                const { stop } = layoutOverlay(reference, overlay);

                endElement.scrollIntoView();

                await waitFor(() => {
                    expect(overlay.getBoundingClientRect()).to.eql(
                        reference.getBoundingClientRect()
                    );
                });

                stop();
            });

            it(`should update overlay position relative to viewport`, async () => {
                const { expectQuery, expectHTMLQuery } = testDriver.render(
                    () => ` 
                        <div id="expander" style="height: 300px;"></div> 
                        <div id="reference" style="outline: 1px solid red;width: 100px; height: 200px; margin: 30px"></div> 
                        <div id="expander" style="height: 200vh;"></div> 
                        <div id="endElement"></div> 
                        <div style="position: fixed;">
                            <div id="overlay" style="outline: 1px solid green;"></div> 
                        </div> 
                    `
                );
                const reference = expectQuery(`#reference`);
                const overlay = expectHTMLQuery(`#overlay`);
                const endElement = expectHTMLQuery(`#endElement`);
                const { stop } = layoutOverlay(reference, overlay);

                endElement.scrollIntoView();
                await sleep(10);

                await waitFor(() => {
                    expect(overlay.getBoundingClientRect()).to.eql(
                        reference.getBoundingClientRect()
                    );
                });

                stop();
            });
        });
    });
    describe(`configure position`, () => {
        it(`should set overlay with relative position`, () => {
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => ` 
                    <div style="width: 400px; height: 400px; display: grid; justify-items: center; align-content: center;"> 
                        <div id="anchor" style="width: 100px; height: 200px; background: blue;"></div> 
                    </div> 
                    <div id="overlay" style="background: green;" /> 
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { stop } = layoutOverlay(anchor, overlay, {
                x: `before`,
                y: `after`,
            });

            const refRect = anchor.getBoundingClientRect();
            const overlayRect = overlay.getBoundingClientRect();
            expect(overlayRect.x, `x position`).to.be.approximately(
                refRect.x - overlayRect.width,
                1
            );
            expect(overlayRect.y, `y position`).to.be.approximately(refRect.bottom, 1);

            stop();
        });
        it(`should update with new position options`, async () => {
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => ` 
                    <div style="width: 400px; height: 400px; display: grid; justify-items: center; align-content: center;"> 
                        <div id="anchor" style="width: 100px; height: 200px; background: blue;"></div> 
                    </div> 
                    <div id="overlay" style="background: green;" /> 
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const { stop, updateOptions } = layoutOverlay(anchor, overlay, {
                x: `before`,
                y: `after`,
            });

            updateOptions({ y: `before` });

            await waitFor(() => {
                const refRect = anchor.getBoundingClientRect();
                const overlayRect = overlay.getBoundingClientRect();
                expect(overlayRect.x, `initial x position`).to.be.approximately(
                    refRect.x - overlayRect.width,
                    1
                );
                expect(overlayRect.y, `updated y position`).to.equal(
                    refRect.y - overlayRect.height
                );
            });

            stop();
        });
        it(`should set overlay with relative position (check various options)`, async () => {
            const expectedRefRect = { left: 150, top: 100, right: 250, bottom: 300 };
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => ` 
                    <div style="width: 400px; height: 400px; display: grid; justify-items: center; align-content: center;"> 
                        <div id="anchor" style="width: 100px; height: 200px; background: blue;"></div> 
                    </div> 
                    <div id="overlay" style="width: 60px; height: 40px; background: green;" /> 
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { stop, updateOptions } = layoutOverlay(anchor, overlay, {
                // keep original size
                width: false,
                height: false,
            });

            const initialBounds = anchor.getBoundingClientRect();
            for (const [prop, value] of Object.entries(expectedRefRect)) {
                expect(
                    initialBounds[prop as keyof typeof initialBounds],
                    `just check the ref is in ${prop} position`
                ).to.be.approximately(value, 1);
            }

            const cases = new Map<
                { x: OverlayPosition; y: OverlayPosition },
                { x: number; y: number }
            >([
                [
                    { x: `before`, y: `after` },
                    { x: 150 - 60, y: 300 },
                ],
                [
                    { x: `start`, y: `end` },
                    { x: 150, y: 300 - 40 },
                ],
                [
                    { x: `center`, y: `center` },
                    { x: 200 - 60 / 2, y: 200 - 40 / 2 },
                ],
                [
                    { x: `end`, y: `start` },
                    { x: 250 - 60, y: 100 },
                ],
                [
                    { x: `after`, y: `before` },
                    { x: 250, y: 100 - 40 },
                ],
            ]);

            for (const [options, expectation] of cases) {
                updateOptions(options);
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                const label = `x: ${options.x}, y: ${options.y}`;
                await waitFor(() => {
                    const overlayRect = overlay.getBoundingClientRect();
                    expect(overlayRect.x, `x position for ${label}`).to.be.approximately(
                        expectation.x,
                        1
                    );
                    expect(overlayRect.y, `y position for ${label}`).to.be.approximately(
                        expectation.y,
                        1
                    );
                });
            }

            stop();
        });
    });
    describe(`configure size`, () => {
        it(`should set overlay with unbound size`, () => {
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => ` 
                    <div style="width: 400px; height: 400px; display: grid; justify-items: center; align-content: center;"> 
                        <div id="anchor" style="width: 100px; height: 200px; background: blue;"></div> 
                    </div> 
                    <div id="overlay" style="width: 80px; height: 35px; background: green;" /> 
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { stop } = layoutOverlay(anchor, overlay, {
                width: false,
                height: false,
            });

            const overlayRect = overlay.getBoundingClientRect();
            expect(overlayRect.width, `unbound width`).to.equal(80);
            expect(overlayRect.height, `unbound height`).to.equal(35);

            stop();
        });
        it(`should update overlay size bind configuration`, async () => {
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => ` 
                    <div style="width: 400px; height: 400px; display: grid; justify-items: center; align-content: center;"> 
                        <div id="anchor" style="width: 100px; height: 200px; background: blue;"></div> 
                    </div> 
                    <div id="overlay" style="height: 35px; background: green;"> 
                        <div id="overlayContent" style="width: 20px;"> 
                    </div> 
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);
            const overlayContent = expectHTMLQuery(`#overlayContent`);

            const { stop, updateOptions } = layoutOverlay(anchor, overlay, {
                width: false,
                height: false,
            });

            const overlayUnboundRect = overlay.getBoundingClientRect();

            updateOptions({ width: true, height: true });

            await waitFor(() => {
                const overlayRect = overlay.getBoundingClientRect();
                expect(overlayRect.width, `bound width`).to.equal(100);
                expect(overlayRect.height, `bound height`).to.equal(200);
            });

            updateOptions({ width: false, height: false });

            await waitFor(() => {
                const overlayRect = overlay.getBoundingClientRect();
                expect(overlayRect.width, `removed bound width`).to.equal(overlayUnboundRect.width);
                expect(overlayRect.height, `removed bound height`).to.equal(
                    overlayUnboundRect.height
                );
            });

            overlayContent.style.width = `60px`;
            const overlayRect = overlay.getBoundingClientRect();
            expect(overlayRect.width, `not restricting initial unrestricted width`).to.equal(60);

            stop();
        });
    });
    describe(`out of viewport`, () => {
        it(`should call handler`, () => {
            const onOverflow = stub();
            const { expectQuery, expectHTMLQuery } = testDriver.render(
                () => `
                    <style>
                        body {overflow: hidden;}
                    </style>
                    <div id="anchor" style=" 
                        position: absolute; top: 100vh; left: 100vw; 
                        width: 100px; height: 200px; background: green;" 
                    ></div> 
                    <div id="overlay" style="outline: 1px solid blue;" /> 
                `
            );
            const anchor = expectQuery(`#anchor`);
            const overlay = expectHTMLQuery(`#overlay`);

            const { stop } = layoutOverlay(anchor, overlay, {
                x: `after`,
                y: `after`,
                onOverflow,
            });

            expect(onOverflow).to.have.callCount(1);
            const overflowData = onOverflow.getCall(0).args[0];
            expect(overflowData.anchor, `anchor`).to.equal(anchor);
            expect(overflowData.overlay, `overlay`).to.equal(overlay);
            expect(overflowData.viewport, `viewport`).to.eql({
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
            });
            expect(overflowData.anchorBounds, `anchor bounds`).to.eql({
                x: document.documentElement.clientWidth,
                y: document.documentElement.clientHeight,
                width: 100,
                height: 200,
            });
            expect(overflowData.overlayBounds, `overlay bounds`).to.eql({
                x: document.documentElement.clientWidth + 100,
                y: document.documentElement.clientHeight + 200,
                width: 100,
                height: 200,
            });

            stop();
        });
    });
});
