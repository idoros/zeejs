import { tooltip, css } from '@zeejs/browser';
import { HTMLTestDriver } from './html-test-driver';
import { getInteractionApi, a11ySnapshot, queryA11yNode } from '@zeejs/test-browser-bridge';
import chai, { expect } from 'chai';
import { stub } from 'sinon';
import { waitFor, sleep } from 'promise-assist';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe(`tooltip`, () => {
    let testDriver: HTMLTestDriver;

    const { hover } = getInteractionApi();

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    describe(`open state`, () => {
        it(`should initiate with false`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor">button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen } = tooltip({ anchor });

            expect(isOpen()).to.equal(false);
        });

        it(`should be positive on focus`, () => {
            // focus anchor -> overlay appear
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor">button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen } = tooltip({ anchor });

            anchor.focus();

            expect(isOpen(), `open on focus`).to.equal(true);
        });

        it(`should be positive on mouse over`, async () => {
            // mouse over anchor -> delay -> overlay appear
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen } = tooltip({ anchor, mouseDelay: 30 });

            await hover(`#anchor`);

            await waitFor(() => {
                expect(isOpen(), `open on hover`).to.equal(true);
            });
        });

        it(`should be negative on mouse out`, async () => {
            // mouse moves outside -> delay -> overlay disappears
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <button id="other" style="width: 30px; height: 30px;">other button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen } = tooltip({ anchor });
            await hover(`#anchor`);
            await waitFor(() => {
                expect(isOpen(), `open on hover`).to.equal(true);
            });

            await hover(`#other`);

            await waitFor(() => {
                expect(isOpen(), `close on out`).to.equal(false);
            });
        });

        it(`should be negative on mouse out (even when focused)`, async () => {
            // mouse moves outside -> delay -> overlay disappears
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <button id="other" style="width: 30px; height: 30px;">other button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen } = tooltip({ anchor });
            await hover(`#anchor`);
            anchor.focus();
            await waitFor(() => {
                expect(isOpen(), `open on hover`).to.equal(true);
            });

            await hover(`#other`);

            await waitFor(() => {
                expect(isOpen(), `close on out`).to.equal(false);
            });
        });

        it(`should persist on mouse out and back over`, async () => {
            // ToDo: keep open when over overlay
            // mouse moves outside -> delay -> mouse over anchor -> overlay persist
            const onToggle = stub();
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <button id="other" style="width: 30px; height: 30px;">other button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen } = tooltip({ anchor, mouseDelay: 200, onToggle });
            await hover(`#anchor`);
            await waitFor(() => {
                expect(isOpen(), `open on hover`).to.equal(true);
            });
            onToggle.reset();

            hover(`#other`);
            await hover(`#anchor`);

            await sleep(250);
            await waitFor(() => {
                expect(isOpen(), `keep open on back`).to.equal(true);
                expect(onToggle, `no open state toggle`).to.have.callCount(0);
            });
        });

        it(`should persist on mouse out and over overlay`, async () => {
            // mouse moves outside -> delay -> mouse over overlay -> overlay persist
            const onToggle = stub();
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <button id="other" style="width: 30px; height: 30px;">other button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen, flagMouseOverOverlay } = tooltip({ anchor, mouseDelay: 200, onToggle });
            await hover(`#anchor`);
            await waitFor(() => {
                expect(isOpen(), `open on hover`).to.equal(true);
            });
            onToggle.reset();

            await hover(`#other`);
            flagMouseOverOverlay(true);

            await sleep(250);
            await waitFor(() => {
                expect(isOpen(), `keep open on back`).to.equal(true);
                expect(onToggle, `no open state toggle`).to.have.callCount(0);
            });
        });

        it(`should persist on mouse over and blur`, async () => {
            // mouse moves over overlay -> blur
            const onToggle = stub();
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <button id="other" style="width: 30px; height: 30px;">other button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen, flagMouseOverOverlay } = tooltip({ anchor, mouseDelay: 200, onToggle });
            anchor.focus();
            onToggle.reset();

            flagMouseOverOverlay(true);
            anchor.blur();

            await waitFor(() => {
                expect(isOpen(), `keep open on back`).to.equal(true);
                expect(onToggle, `no open state toggle`).to.have.callCount(0);
            });
        });

        it(`should be negative on mouse out of overlay`, async () => {
            // mouse moves outside -> delay -> mouse over overlay -> mouse out of overlay -> delay -> overlay disappears
            const onToggle = stub();
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <button id="other" style="width: 30px; height: 30px;">other button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen, flagMouseOverOverlay } = tooltip({ anchor, mouseDelay: 200, onToggle });
            await hover(`#anchor`);
            await waitFor(() => {
                expect(isOpen(), `open on hover`).to.equal(true);
            });
            await hover(`#other`);
            flagMouseOverOverlay(true);
            onToggle.reset();

            flagMouseOverOverlay(false);

            await sleep(250);
            await waitFor(() => {
                expect(isOpen(), `close on out`).to.equal(false);
                expect(onToggle, `close state on out of overlay`).to.have.callCount(1);
            });
        });

        it(`should be negative on mouse move outside (out of anchor and overlay)`, async () => {
            // mouse moves outside -> delay -> overlay disappears
            const onToggle = stub();
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <button id="other" style="width: 30px; height: 30px;">other button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen } = tooltip({ anchor, onToggle });
            anchor.focus();
            await waitFor(() => {
                expect(isOpen(), `open on focus`).to.equal(true);
            });
            onToggle.reset();

            await hover(`#other`);

            await waitFor(() => {
                expect(isOpen(), `close on move outside`).to.equal(false);
                expect(onToggle, `close state on move outside`).to.have.callCount(1);
            });
        });

        it(`should persist on mouse out and focus`, async () => {
            // mouse moves outside -> delay -> focus anchor -> overlay persist
            const onToggle = stub();
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <button id="other" style="width: 30px; height: 30px;">other button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen } = tooltip({ anchor, mouseDelay: 200, onToggle });
            await hover(`#anchor`);
            await waitFor(() => {
                expect(isOpen(), `open on hover`).to.equal(true);
            });
            onToggle.reset();

            await hover(`#other`);
            anchor.focus();

            await sleep(250);
            await waitFor(() => {
                expect(isOpen(), `keep open on focus`).to.equal(true);
                expect(onToggle, `no open state toggle`).to.have.callCount(0);
            });
        });

        it(`should persist on mouse out and focus into overlay`, async () => {
            // mouse moves outside -> delay -> focus overlay -> overlay persist
            const onToggle = stub();
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <button id="other" style="width: 30px; height: 30px;">other button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen, flagOverlayFocus } = tooltip({ anchor, mouseDelay: 200, onToggle });
            await hover(`#anchor`);
            await waitFor(() => {
                expect(isOpen(), `open on hover`).to.equal(true);
            });
            onToggle.reset();

            await hover(`#other`);
            flagOverlayFocus(true);

            await sleep(250);
            await waitFor(() => {
                expect(isOpen(), `keep open on focus overlay`).to.equal(true);
                expect(onToggle, `no open state toggle`).to.have.callCount(0);
            });
        });

        it(`should persist on focus out into overlay`, async () => {
            // focus out -> delay -> focus overlay -> overlay persist
            const onToggle = stub();
            const checkInOverlay = stub().returns(true);
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <div id="overlay" style="width: 30px; height: 30px;">
                    <div>overlay</div>
                    <input id="overlayInput"></input>
                </div>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const overlay = expectHTMLQuery(`#overlay`);
            const overlayInput = expectHTMLQuery(`#overlayInput`);
            const { isOpen } = tooltip({
                anchor,
                overlay,
                mouseDelay: 200,
                onToggle,
                isInOverlay: checkInOverlay,
            });
            anchor.focus();
            onToggle.reset();

            overlayInput.focus();
            await waitFor(() => {
                expect(checkInOverlay, `check focused`).to.have.been.calledOnceWith(
                    overlayInput,
                    overlay
                );
            });

            await sleep(250);
            await waitFor(() => {
                expect(isOpen(), `keep open on overlay focus`).to.equal(true);
                expect(onToggle, `no open state toggle`).to.have.callCount(0);
            });
        });

        it(`should be negative on blur`, async () => {
            // focus out -> content disappears (async delay, mouse outside)
            const onToggle = stub();
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <button id="other" style="width: 30px; height: 30px;">other button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen } = tooltip({ anchor, mouseDelay: 200, onToggle });
            await hover(`#anchor`);
            await waitFor(() => {
                expect(isOpen(), `open on hover`).to.equal(true);
            });
            anchor.focus();
            onToggle.reset();

            anchor.blur();

            await waitFor(() => {
                expect(isOpen(), `close on blur`).to.equal(false);
                expect(onToggle, `close toggle state`).to.have.calledOnceWith(false);
            });
        });

        it(`should be negative on click outside`, async () => {
            // click outside -> overlay disappears -> focus is disabled momentarily
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
                <button id="other" style="width: 30px; height: 30px;">other button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen, flagClickOutside } = tooltip({ anchor });
            await hover(`#anchor`);
            await waitFor(() => {
                expect(isOpen(), `open on hover`).to.equal(true);
            });

            flagClickOutside();

            await waitFor(() => {
                expect(isOpen(), `close on click outside`).to.equal(false);
            });

            anchor.blur();
            anchor.focus();

            // incase delayed render refocus anchor
            expect(isOpen(), `focus disabled for a moment`).to.equal(false);

            await sleep(100);

            anchor.blur();
            anchor.focus();

            await waitFor(() => {
                expect(isOpen(), `focus enabled`).to.equal(true);
            });
        });

        it(`should be negative on escape press`, async () => {
            // mouse escape -> overlay disappears
            const onToggle = stub();
            const stopPropagation = stub();
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="anchor" style="width: 30px; height: 30px;">button</button>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const { isOpen, onEscape } = tooltip({ anchor, onToggle });
            await hover(`#anchor`);
            await waitFor(() => {
                expect(isOpen(), `open on hover`).to.equal(true);
            });
            onToggle.reset();
            const event = Object.assign({}, new KeyboardEvent('keydown'), {
                stopPropagation,
            });

            onEscape(event);

            await waitFor(() => {
                expect(isOpen(), `close on out`).to.equal(false);
                expect(onToggle, `close state on escape`).to.have.callCount(1);
                expect(stopPropagation, `stopPropagation on escape event`).to.have.callCount(1);
            });
        });
    });

    describe(`display`, () => {
        it(`should be hidden until overlay is open`, async () => {
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
                <span id="overlay">
                    <span id="overlayInner">overlay</span>
                </span>
            `
            );
            const anchor = expectHTMLQuery(`#anchor`) as HTMLButtonElement;
            const overlay = expectHTMLQuery(`#overlay`);
            const overlayInner = expectHTMLQuery(`#overlayInner`);

            const { initialOverlayCSSClass } = tooltip({
                anchor,
                overlay,
            });

            expect(
                overlay.classList.contains(initialOverlayCSSClass),
                `overlay is set with initial CSS class`
            ).to.equal(true);
            expect(getComputedStyle(overlay).visibility, `overlay hidden before`).to.equal(
                `hidden`
            );
            expect(
                getComputedStyle(overlayInner).visibility,
                `overlay inner hidden before`
            ).to.equal(`hidden`);

            anchor.focus();

            await waitFor(() => {
                expect(
                    getComputedStyle(overlay).visibility,
                    `overlay visible when opened`
                ).to.equal(`visible`);
                expect(
                    getComputedStyle(overlayInner).visibility,
                    `overlay inner visible when opened`
                ).to.equal(`visible`);
            });
        });

        it(`should keep position above anchor by default`, async () => {
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

            tooltip({
                anchor,
                overlay,
            });

            anchor.focus();

            await waitFor(() => {
                const anchorRect = anchor.getBoundingClientRect();
                const overlayRect = overlay.getBoundingClientRect();
                expect(Math.round(overlayRect.bottom), `above`).to.equal(anchorRect.top);
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

            tooltip({
                anchor,
                overlay,
                positionX: `after`,
                positionY: `after`,
            });

            anchor.focus();

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

            const { updatePosition } = tooltip({
                anchor,
                overlay,
                positionX: `after`,
                positionY: `after`,
            });

            anchor.focus();

            updatePosition({
                x: `before`,
                y: `before`,
            });

            await waitFor(() => {
                const anchorRect = anchor.getBoundingClientRect();
                const overlayRect = overlay.getBoundingClientRect();
                expect(overlayRect.bottom, `above`).to.be.approximately(anchorRect.top, 0.5);
                expect(overlayRect.right, `left of`).to.be.approximately(anchorRect.left, 0.5);
            });
        });

        describe(`margin`, () => {
            it(`should position with extra margin`, async () => {
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

                tooltip({
                    anchor,
                    overlay,
                    positionX: `after`,
                    positionY: `before`,
                    margin: 10,
                });

                anchor.focus();

                await waitFor(() => {
                    const anchorRect = anchor.getBoundingClientRect();
                    const overlayRect = overlay.getBoundingClientRect();
                    expect(Math.round(overlayRect.bottom), `above - 10`).to.equal(
                        anchorRect.top - 10
                    );
                    expect(Math.round(overlayRect.left), `right of + 10`).to.equal(
                        anchorRect.right + 10
                    );
                });
            });
            it(`should update margin`, async () => {
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

                const { updatePosition } = tooltip({
                    anchor,
                    overlay,
                    positionX: `after`,
                    positionY: `after`,
                });

                anchor.focus();

                updatePosition({
                    margin: 10,
                });

                await waitFor(() => {
                    const anchorRect = anchor.getBoundingClientRect();
                    const overlayRect = overlay.getBoundingClientRect();
                    expect(overlayRect.top, `below + 10`).to.be.approximately(
                        anchorRect.bottom + 10,
                        0.5
                    );
                    expect(overlayRect.left, `right of + 10`).to.be.approximately(
                        anchorRect.right + 10,
                        0.5
                    );
                });

                updatePosition({
                    margin: 0,
                });

                await waitFor(() => {
                    const anchorRect = anchor.getBoundingClientRect();
                    const overlayRect = overlay.getBoundingClientRect();
                    expect(overlayRect.top, `below + 0`).to.be.approximately(
                        anchorRect.bottom,
                        0.5
                    );
                    expect(overlayRect.left, `right of + 0`).to.be.approximately(
                        anchorRect.right,
                        0.5
                    );
                });
            });
        });
    });

    describe(`aria`, () => {
        it(`should set overlay role=tooltip & and default to connect aria-labelledby`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="trigger">origin</button>
                <div id="layer">overlay</div>
                
            `
            );
            const anchor = expectHTMLQuery(`#trigger`) as HTMLButtonElement;
            const overlay = expectHTMLQuery(`#layer`);

            const { setAnchor } = tooltip({ anchor, overlay });

            const snapshot = await a11ySnapshot({ interestingOnly: false });
            expect(
                queryA11yNode(snapshot, {
                    role: `button`,
                    name: `overlay`,
                }),
                `set aria-labelledby default`
            ).to.not.equal(null);
            expect(
                queryA11yNode(snapshot, {
                    role: `tooltip`,
                    name: `overlay`,
                }),
                `add tooltip role`
            ).to.not.equal(null);

            setAnchor(document.createElement(`div`));

            expect(anchor.getAttribute(`aria-labelledby`), `reverse laballedby`).to.equal(null);
        });
        it(`should respect initial anchor aria-labelledby & aria-describedby`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <label id="label">intended label</label>
                <label id="desc">intended description</label>
                <button id="trigger" aria-labelledby="label" aria-describedby="desc">origin</button>
                <div id="layer">overlay</div>
                
            `
            );
            const anchor = expectHTMLQuery(`#trigger`) as HTMLButtonElement;
            const overlay = expectHTMLQuery(`#layer`);

            tooltip({ anchor, overlay });

            const snapshot = await a11ySnapshot({ interestingOnly: false });
            expect(
                queryA11yNode(snapshot, {
                    role: `button`,
                    name: `intended label`,
                    description: `intended description`,
                }),
                `source labelledby & describedby preserved`
            ).to.not.equal(null);
        });
        it(`should insert overlay id on aria-labelledby placeholder`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <label id="label">a button with a tooltip</label>
                <button id="trigger" aria-labelledby="label TOOLTIP">origin</button>
                <div id="layer">overlay</div>
            `
            );
            const anchor = expectHTMLQuery(`#trigger`) as HTMLButtonElement;
            const overlay = expectHTMLQuery(`#layer`);

            const { setAnchor } = tooltip({ anchor, overlay });

            const snapshot = await a11ySnapshot({ interestingOnly: false });
            expect(
                queryA11yNode(snapshot, {
                    role: `button`,
                    name: `a button with a tooltip overlay`,
                }),
                `labelledby from both references`
            ).to.not.equal(null);

            setAnchor(document.createElement(`div`));

            expect(anchor.getAttribute(`aria-labelledby`), `reverse laballedby`).to.equal(
                `label TOOLTIP`
            );
        });
        it(`should set overlay id on aria-describedby placeholder`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="trigger" aria-describedby="TOOLTIP">origin</button>
                <div id="layer">overlay</div>
            `
            );
            const anchor = expectHTMLQuery(`#trigger`) as HTMLButtonElement;
            const overlay = expectHTMLQuery(`#layer`);

            const { setAnchor } = tooltip({ anchor, overlay });

            const snapshot = await a11ySnapshot({ interestingOnly: false });
            expect(
                queryA11yNode(snapshot, {
                    role: `button`,
                    name: `origin`,
                    description: `overlay`,
                }),
                `aria-describedby referencing tooltip id`
            ).to.not.equal(null);

            setAnchor(document.createElement(`div`));

            expect(anchor.getAttribute(`aria-describedby`), `reverse describedby`).to.equal(
                `TOOLTIP`
            );
        });
        it(`should not connect aria-labelledby when aria-label exist`, async () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <button id="trigger" aria-label="inline label">origin</button>
                <div id="layer">overlay</div>
                
            `
            );
            const anchor = expectHTMLQuery(`#trigger`) as HTMLButtonElement;
            const overlay = expectHTMLQuery(`#layer`);

            tooltip({ anchor, overlay });

            const snapshot = await a11ySnapshot({ interestingOnly: false });
            expect(
                queryA11yNode(snapshot, {
                    role: `button`,
                    name: `inline label`,
                }),
                `labelledby not set`
            ).to.not.equal(null);
        });
    });
});
