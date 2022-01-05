import { Root, Tooltip, OverlayPosition } from '@zeejs/react';
import { domElementMatchers } from './chai-dom-element';
import { ReactTestDriver } from './react-test-driver';
import { getInteractionApi } from '@zeejs/test-browser-bridge';
import React from 'react';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { waitFor, sleep } from 'promise-assist';
chai.use(sinonChai);
chai.use(domElementMatchers);

describe(`react tooltip`, () => {
    let testDriver: ReactTestDriver;
    const { hover, keyboard } = getInteractionApi();

    before('setup test driver', () => (testDriver = new ReactTestDriver()));
    afterEach('clear test driver', () => {
        testDriver.clean();
        sinon.restore();
    });

    describe(`open state`, () => {
        it(`should show tooltip on parent element hover & hide on out (default 0.5s delay)`, async function () {
            this.timeout(3000);
            const { expectQuery, query } = testDriver.render(() => (
                <Root>
                    <div id="other-node" style={{ padding: `100px` }}>
                        other node content
                    </div>
                    <div id="parent-node">
                        <span>parent content</span>
                        <Tooltip>
                            <span id="tooltip-node">tooltip content</span>
                        </Tooltip>
                    </div>
                </Root>
            ));

            expect(query(`#tooltip-node`), `before hover`).to.not.be.domElement();

            await hover(`#parent-node`);

            await waitFor(() => {
                const parentNode = expectQuery(`#parent-node`);
                const tooltipNode = expectQuery(`#tooltip-node`);
                expect(parentNode).domElement().preceding(tooltipNode);
            });

            await hover(`#other-node`);

            await waitFor(() => {
                expect(query(`#tooltip-node`), `hover out`).to.not.be.domElement();
            });
        });

        it(`should show tooltip on parent element hover & hide on out with custom mouse delay`, async () => {
            const { expectQuery, query } = testDriver.render(() => (
                <Root>
                    <div id="other-node" style={{ padding: `100px` }}>
                        other node content
                    </div>
                    <div id="parent-node">
                        <span>parent content</span>
                        <Tooltip mouseDelay={10}>
                            <span id="tooltip-node">tooltip content</span>
                        </Tooltip>
                    </div>
                </Root>
            ));

            expect(query(`#tooltip-node`), `before hover`).to.not.be.domElement();

            await hover(`#parent-node`);

            // should be ready before hover is returned
            await waitFor(
                () => {
                    const parentNode = expectQuery(`#parent-node`);
                    const tooltipNode = expectQuery(`#tooltip-node`);
                    expect(parentNode).domElement().preceding(tooltipNode);
                },
                { timeout: 50 }
            );

            await hover(`#other-node`);

            await waitFor(
                () => {
                    expect(query(`#tooltip-node`), `hover out`).to.not.be.domElement();
                },
                { timeout: 50 }
            );
        });

        it(`should show tooltip on parent focus & hide on blur`, async () => {
            const { expectHTMLQuery, query } = testDriver.render(() => (
                <Root>
                    <div id="parent-node" tabIndex={0}>
                        <span>parent content</span>
                        <Tooltip>
                            <span id="tooltip-node">tooltip content</span>
                        </Tooltip>
                    </div>
                </Root>
            ));

            const parentNode = expectHTMLQuery(`#parent-node`);

            parentNode.focus();

            const tooltipNode = expectHTMLQuery(`#tooltip-node`);
            expect(parentNode).domElement().preceding(tooltipNode);

            parentNode.blur();

            await waitFor(() => {
                expect(query(`#tooltip-node`), `hover out`).to.not.be.domElement();
            });
        });

        it(`should persist on mouse out and over overlay`, async () => {
            const { expectQuery } = testDriver.render(() => (
                <Root>
                    <div id="other-node" style={{ padding: `100px` }}>
                        other node content
                    </div>
                    <div id="parent-node">
                        <span>parent content</span>
                        <Tooltip mouseDelay={200}>
                            <span id="tooltip-node">tooltip content</span>
                        </Tooltip>
                    </div>
                </Root>
            ));

            await hover(`#parent-node`);

            await waitFor(() => {
                const parentNode = expectQuery(`#parent-node`);
                const tooltipNode = expectQuery(`#tooltip-node`);
                expect(parentNode).domElement().preceding(tooltipNode);
            });

            hover(`#other-node`);
            await hover(`#tooltip-node`);

            await sleep(250);

            await waitFor(() => {
                const parentNode = expectQuery(`#parent-node`);
                const tooltipNode = expectQuery(`#tooltip-node`);
                expect(parentNode).domElement().preceding(tooltipNode);
            });
        });

        it(`should persist on focus in overlay and hide on blur`, async () => {
            const { expectHTMLQuery, query } = testDriver.render(() => (
                <Root>
                    <button id="other-node" style={{ padding: `100px` }}>
                        other node content
                    </button>
                    <div tabIndex={0} id="parent-node">
                        <span>parent content</span>
                        <Tooltip>
                            <button id="tooltip-node">tooltip content</button>
                        </Tooltip>
                    </div>
                </Root>
            ));
            const parentNode = expectHTMLQuery(`#parent-node`);

            parentNode.focus();

            await waitFor(() => {
                const tooltipNode = expectHTMLQuery(`#tooltip-node`);
                expect(getComputedStyle(tooltipNode).visibility).to.equal('visible');
                expect(parentNode).domElement().preceding(tooltipNode);
            });

            expectHTMLQuery(`#tooltip-node`).focus();

            await sleep(250);

            await waitFor(() => {
                const tooltipNode = expectHTMLQuery(`#tooltip-node`);
                expect(parentNode).domElement().preceding(tooltipNode);
            });

            await hover(`#other-node`);
            expectHTMLQuery(`#other-node`).focus();

            await waitFor(() => {
                expect(query(`#tooltip-node`), `blur out`).to.not.be.domElement();
            });
        });

        it(`should hide tooltip on click outside`, async () => {
            const { expectHTMLQuery, query } = testDriver.render(() => (
                <Root>
                    <div id="parent-node">
                        <span>parent content</span>
                        <Tooltip>
                            <span id="tooltip-node">tooltip content</span>
                        </Tooltip>
                    </div>
                    <div id="outside-node" style={{ width: `200px`, height: `200px` }}></div>
                </Root>
            ));

            await hover(`#parent-node`);

            await waitFor(() => {
                const parentNode = expectHTMLQuery(`#parent-node`);
                const tooltipNode = expectHTMLQuery(`#tooltip-node`);
                expect(parentNode).domElement().preceding(tooltipNode);
            });

            // direct click with no mouseout event
            expectHTMLQuery(`#outside-node`).click();

            await waitFor(() => {
                expect(query(`#tooltip-node`), `click outside`).to.not.be.domElement();
            });
        });

        it(`should hide tooltip on escape`, async () => {
            const { expectHTMLQuery, query } = testDriver.render(() => (
                <Root>
                    <div id="parent-node">
                        <span>parent content</span>
                        <Tooltip>
                            <span id="tooltip-node">tooltip content</span>
                        </Tooltip>
                    </div>
                    <div id="outside-node" style={{ width: `200px`, height: `200px` }}></div>
                </Root>
            ));

            await hover(`#parent-node`);

            await waitFor(() => {
                const parentNode = expectHTMLQuery(`#parent-node`);
                const tooltipNode = expectHTMLQuery(`#tooltip-node`);
                expect(parentNode).domElement().preceding(tooltipNode);
            });

            // direct click with no mouseout event
            await keyboard.press(`Escape`);

            await waitFor(() => {
                expect(query(`#tooltip-node`), `removed on escape`).to.not.be.domElement();
            });
        });
    });

    describe(`position`, () => {
        it(`should position relative to parent (default: above & center)`, async () => {
            const { expectHTMLQuery } = testDriver.render(() => (
                <Root
                    style={{
                        width: `300px`,
                        height: `300px`,
                        display: `grid`,
                        justifyItems: `center`,
                        alignContent: `center`,
                    }}
                >
                    <div
                        id="parent-node"
                        tabIndex={0}
                        style={{ width: `100px`, height: `40px`, background: 'red' }}
                    >
                        <Tooltip>
                            <div
                                id="tooltip-node"
                                style={{ width: `80px`, height: `20px`, background: 'green' }}
                            ></div>
                        </Tooltip>
                    </div>
                </Root>
            ));

            await hover(`#parent-node`);

            await waitFor(() => {
                const tooltipNode = expectHTMLQuery(`#tooltip-node`);
                const parentNode = expectHTMLQuery(`#parent-node`);
                const tooltipBounds = tooltipNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(tooltipBounds.bottom, `tooltip above`).to.be.approximately(
                    parentBounds.top,
                    1
                );
                expect(
                    tooltipBounds.right - tooltipBounds.width / 2,
                    `tooltip x centered`
                ).to.be.approximately(parentBounds.right - parentBounds.width / 2, 1);
            });
        });

        it(`should position relative to parent (custom: below & right)`, async () => {
            const { expectHTMLQuery } = testDriver.render(() => (
                <Root
                    style={{
                        width: `300px`,
                        height: `300px`,
                        display: `grid`,
                        justifyItems: `center`,
                        alignContent: `center`,
                    }}
                >
                    <div
                        id="parent-node"
                        tabIndex={0}
                        style={{ width: `100px`, height: `40px`, background: 'red' }}
                    >
                        <Tooltip positionX="after" positionY="after">
                            <div
                                id="tooltip-node"
                                style={{ width: `80px`, height: `20px`, background: 'green' }}
                            ></div>
                        </Tooltip>
                    </div>
                </Root>
            ));

            await hover(`#parent-node`);

            await waitFor(() => {
                const tooltipNode = expectHTMLQuery(`#tooltip-node`);
                const parentNode = expectHTMLQuery(`#parent-node`);
                const tooltipBounds = tooltipNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(tooltipBounds.top, `tooltip below`).to.equal(parentBounds.bottom);
                expect(tooltipBounds.left, `tooltip right of`).to.equal(parentBounds.right);
            });
        });

        it(`should update relative position`, async () => {
            const { expectHTMLQuery, setData } = testDriver.render<OverlayPosition>(
                (pos) => (
                    <Root
                        style={{
                            width: `300px`,
                            height: `300px`,
                            display: `grid`,
                            justifyItems: `center`,
                            alignContent: `center`,
                        }}
                    >
                        <div
                            id="parent-node"
                            tabIndex={0}
                            style={{ width: `100px`, height: `40px`, background: 'red' }}
                        >
                            <Tooltip positionX={pos} positionY={pos}>
                                <div
                                    id="tooltip-node"
                                    style={{ width: `80px`, height: `20px`, background: 'green' }}
                                ></div>
                            </Tooltip>
                        </div>
                    </Root>
                ),
                { initialData: `after` }
            );

            await hover(`#parent-node`);

            setData(`before`);

            await waitFor(() => {
                const tooltipNode = expectHTMLQuery(`#tooltip-node`);
                const parentNode = expectHTMLQuery(`#parent-node`);
                const tooltipBounds = tooltipNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(tooltipBounds.bottom, `tooltip above`).to.equal(parentBounds.top);
                expect(tooltipBounds.right, `tooltip left of`).to.equal(parentBounds.left);
            });
        });

        describe(`margin`, () => {
            it(`should space from anchor`, async () => {
                const { expectHTMLQuery } = testDriver.render(() => (
                    <Root
                        style={{
                            width: `300px`,
                            height: `300px`,
                            display: `grid`,
                            justifyItems: `center`,
                            alignContent: `center`,
                        }}
                    >
                        <div
                            id="parent-node"
                            tabIndex={0}
                            style={{ width: `100px`, height: `40px`, background: 'red' }}
                        >
                            <Tooltip positionX="after" positionY="after" margin={10}>
                                <div
                                    id="tooltip-node"
                                    style={{ width: `80px`, height: `20px`, background: 'green' }}
                                ></div>
                            </Tooltip>
                        </div>
                    </Root>
                ));

                await hover(`#parent-node`);

                await waitFor(() => {
                    const tooltipNode = expectHTMLQuery(`#tooltip-node`);
                    const parentNode = expectHTMLQuery(`#parent-node`);
                    const tooltipBounds = tooltipNode.getBoundingClientRect();
                    const parentBounds = parentNode.getBoundingClientRect();
                    expect(tooltipBounds.top, `tooltip below + margin`).to.equal(
                        parentBounds.bottom + 10
                    );
                    expect(tooltipBounds.left, `tooltip right of + margin`).to.equal(
                        parentBounds.right + 10
                    );
                });
            });
            it(`should update when changed`, async () => {
                const { expectHTMLQuery, setData } = testDriver.render<number>(
                    (margin) => (
                        <Root
                            style={{
                                width: `300px`,
                                height: `300px`,
                                display: `grid`,
                                justifyItems: `center`,
                                alignContent: `center`,
                            }}
                        >
                            <div
                                id="parent-node"
                                tabIndex={0}
                                style={{ width: `100px`, height: `40px`, background: 'red' }}
                            >
                                <Tooltip positionX="after" positionY="after" margin={margin}>
                                    <div
                                        id="tooltip-node"
                                        style={{
                                            width: `80px`,
                                            height: `20px`,
                                            background: 'green',
                                        }}
                                    ></div>
                                </Tooltip>
                            </div>
                        </Root>
                    ),
                    { initialData: 10 }
                );

                await hover(`#parent-node`);

                setData(20);

                await waitFor(() => {
                    const tooltipNode = expectHTMLQuery(`#tooltip-node`);
                    const parentNode = expectHTMLQuery(`#parent-node`);
                    const tooltipBounds = tooltipNode.getBoundingClientRect();
                    const parentBounds = parentNode.getBoundingClientRect();
                    expect(tooltipBounds.top, `tooltip below + margin`).to.equal(
                        parentBounds.bottom + 20
                    );
                    expect(tooltipBounds.left, `tooltip right of + margin`).to.equal(
                        parentBounds.right + 20
                    );
                });
            });
        });
    });
});
