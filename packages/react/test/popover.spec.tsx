import { Root, Popover, OverlayPosition } from '@zeejs/react';
import { domElementMatchers } from './chai-dom-element';
import { ReactTestDriver } from './react-test-driver';
import { getInteractionApi } from '@zeejs/test-browser-bridge';
import React from 'react';
import chai, { expect } from 'chai';
import sinon, { stub } from 'sinon';
import sinonChai from 'sinon-chai';
import { waitFor } from 'promise-assist';
chai.use(sinonChai);
chai.use(domElementMatchers);

describe(`react popover`, () => {
    let testDriver: ReactTestDriver;
    const { clickIfPossible, click } = getInteractionApi();

    before('setup test driver', () => (testDriver = new ReactTestDriver()));
    afterEach('clear test driver', () => {
        testDriver.clean();
        sinon.restore();
    });

    describe(`position`, () => {
        it(`should position relative to parent (default: below & center)`, async () => {
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
                        style={{ width: `100px`, height: `40px`, background: 'red' }}
                    >
                        <Popover>
                            <div
                                id="popover-node"
                                style={{ width: `80px`, height: `20px`, background: 'green' }}
                            ></div>
                        </Popover>
                    </div>
                </Root>
            ));

            await waitFor(() => {
                const popoverNode = expectHTMLQuery(`#popover-node`);
                const parentNode = expectHTMLQuery(`#parent-node`);
                const popoverBounds = popoverNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(popoverBounds.top, `popover below`).to.be.approximately(
                    parentBounds.bottom,
                    1
                );
                expect(
                    popoverBounds.right - popoverBounds.width / 2,
                    `popover x centered`
                ).to.be.approximately(parentBounds.right - parentBounds.width / 2, 1);
            });
        });
        it(`should position relative to parent (custom: above & left)`, async () => {
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
                        style={{ width: `100px`, height: `40px`, background: 'red' }}
                    >
                        <Popover positionX="before" positionY="before">
                            <div
                                id="popover-node"
                                style={{ width: `80px`, height: `20px`, background: 'green' }}
                            ></div>
                        </Popover>
                    </div>
                </Root>
            ));

            await waitFor(() => {
                const popoverNode = expectHTMLQuery(`#popover-node`);
                const parentNode = expectHTMLQuery(`#parent-node`);
                const popoverBounds = popoverNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(popoverBounds.bottom, `popover above`).to.equal(parentBounds.top);
                expect(popoverBounds.right, `popover left of`).to.equal(parentBounds.left);
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
                            style={{ width: `100px`, height: `40px`, background: 'red' }}
                        >
                            <Popover positionX={pos} positionY={pos}>
                                <div
                                    id="popover-node"
                                    style={{ width: `80px`, height: `20px`, background: 'green' }}
                                ></div>
                            </Popover>
                        </div>
                    </Root>
                ),
                { initialData: `after` }
            );

            setData(`before`);

            await waitFor(() => {
                const popoverNode = expectHTMLQuery(`#popover-node`);
                const parentNode = expectHTMLQuery(`#parent-node`);
                const popoverBounds = popoverNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(popoverBounds.bottom, `popover above`).to.equal(parentBounds.top);
                expect(popoverBounds.right, `popover left of`).to.equal(parentBounds.left);
            });
        });
        it(`should cover anchor while keeping in view (default)`, async () => {
            const { expectHTMLQuery } = testDriver.render(() => (
                <Root>
                    <div
                        id="parent-node"
                        style={{
                            position: `fixed`,
                            bottom: 0,
                            right: 0,
                            width: `100px`,
                            height: `40px`,
                            background: 'red',
                        }}
                    >
                        <Popover positionX="after" positionY="after">
                            <div
                                id="popover-node"
                                style={{ width: `80px`, height: `20px`, background: 'green' }}
                            ></div>
                        </Popover>
                    </div>
                </Root>
            ));

            await waitFor(() => {
                const popoverNode = expectHTMLQuery(`#popover-node`);
                const parentNode = expectHTMLQuery(`#parent-node`);
                const popoverBounds = popoverNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(popoverBounds.bottom, `popover bottom`).to.equal(parentBounds.bottom);
                expect(popoverBounds.right, `popover right`).to.equal(parentBounds.right);
            });
        });
        it(`should optionally avoid anchor in case of overflow`, async () => {
            const { expectHTMLQuery, setData } = testDriver.render(
                ({ avoidAnchor }) => (
                    <Root>
                        <div
                            id="parent-node"
                            style={{
                                position: `fixed`,
                                bottom: 0,
                                right: 0,
                                width: `100px`,
                                height: `40px`,
                                background: 'red',
                            }}
                        >
                            <Popover positionX="after" positionY="after" avoidAnchor={avoidAnchor}>
                                <div
                                    id="popover-node"
                                    style={{ width: `80px`, height: `20px`, background: 'green' }}
                                ></div>
                            </Popover>
                        </div>
                    </Root>
                ),
                { initialData: { avoidAnchor: true } }
            );

            await waitFor(() => {
                const popoverNode = expectHTMLQuery(`#popover-node`);
                const parentNode = expectHTMLQuery(`#parent-node`);
                const popoverBounds = popoverNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(popoverBounds.right, `popover pushed on x`).to.equal(parentBounds.right);
                expect(popoverBounds.bottom, `popover flipped on y`).to.equal(parentBounds.top);
            });

            setData({ avoidAnchor: false });

            await waitFor(() => {
                const popoverNode = expectHTMLQuery(`#popover-node`);
                const parentNode = expectHTMLQuery(`#parent-node`);
                const popoverBounds = popoverNode.getBoundingClientRect();
                const parentBounds = parentNode.getBoundingClientRect();
                expect(popoverBounds.bottom, `popover bottom`).to.equal(parentBounds.bottom);
                expect(popoverBounds.right, `popover right`).to.equal(parentBounds.right);
            });
        });
        it.skip(`should configure overflow modes (x,y,both,none)`);
    });
    describe(`size`, () => {
        it(`should keep original by default`, () => {
            const { expectQuery } = testDriver.render(() => (
                <Root>
                    <div style={{ width: `50px`, height: `60px` }}>
                        <Popover>
                            <div id="popover" style={{ width: `100px`, height: `200px` }}></div>
                        </Popover>
                    </div>
                </Root>
            ));
            const popover = expectQuery(`#popover`);

            const popoverBounds = popover.getBoundingClientRect();
            expect(popoverBounds.width, `width`).to.equal(100);
            expect(popoverBounds.height, `height`).to.equal(200);
        });
        it(`should match anchor size`, async () => {
            const { expectQuery } = testDriver.render(() => (
                <Root>
                    <div style={{ width: `50px`, height: `60px` }}>
                        <Popover matchWidth={true} matchHeight={true}>
                            <div id="popover" style={{ width: `100%`, height: `100%` }}></div>
                        </Popover>
                    </div>
                </Root>
            ));
            const popover = expectQuery(`#popover`);

            await waitFor(() => {
                const popoverBounds = popover.getBoundingClientRect();
                expect(popoverBounds.width, `width`).to.equal(50);
                expect(popoverBounds.height, `height`).to.equal(60);
            });
        });
        it(`should update size on prop change`, async () => {
            const { expectQuery, setData } = testDriver.render<{
                matchWidth: boolean;
                matchHeight: boolean;
            }>(
                ({ matchWidth, matchHeight }) => (
                    <Root>
                        <div style={{ width: `50px`, height: `60px`, background: `red` }}>
                            <Popover matchWidth={matchWidth} matchHeight={matchHeight}>
                                <div
                                    id="popover"
                                    style={{ width: `100%`, height: `100%`, background: `green` }}
                                >
                                    x
                                </div>
                            </Popover>
                        </div>
                    </Root>
                ),
                {
                    initialData: { matchWidth: true, matchHeight: true },
                }
            );
            const popover = expectQuery(`#popover`);

            await waitFor(() => {
                const popoverBounds = popover.getBoundingClientRect();
                expect(popoverBounds.width, `width`).to.equal(50);
                expect(popoverBounds.height, `height`).to.equal(60);
            });

            setData({ matchWidth: false, matchHeight: true });

            await waitFor(() => {
                const popoverBounds = popover.getBoundingClientRect();
                expect(popoverBounds.width, `width not restricted`).to.not.equal(50);
                expect(popoverBounds.height, `height still restricted`).to.equal(60);
            });

            setData({ matchWidth: true, matchHeight: false });

            await waitFor(() => {
                const popoverBounds = popover.getBoundingClientRect();
                expect(popoverBounds.width, `width restricted again`).to.equal(50);
                expect(popoverBounds.height, `height not restricted`).to.not.equal(60);
            });
        });
    });
    describe(`backdrop`, () => {
        it(`should default to interactive background`, async () => {
            const contentClick = stub();
            testDriver.render(() => (
                <Root>
                    <div
                        id="back-item"
                        onClick={contentClick}
                        style={{ width: `100vw`, height: `100vh` }}
                    />
                    <Popover>
                        <div style={{ width: `100px`, height: `200px` }}></div>
                    </Popover>
                </Root>
            ));

            await click(`#back-item`);

            expect(contentClick).to.have.callCount(1);
        });
        it(`should accept custom backdrop`, async () => {
            const contentClick = stub();
            testDriver.render(() => (
                <Root>
                    <div
                        id="back-item"
                        onClick={contentClick}
                        style={{ width: `100vw`, height: `100vh` }}
                    />
                    <Popover backdrop="block">
                        <div style={{ width: `100px`, height: `200px` }}></div>
                    </Popover>
                </Root>
            ));

            expect(await clickIfPossible(`#back-item`), `not clickable`).to.equal(false);
            expect(contentClick).to.have.callCount(0);
        });
        it.skip(`should update backdrop on prop change`, async () => {
            const contentClick = stub();
            const { setData } = testDriver.render<'none' | 'block'>(
                (backdrop) => (
                    <Root>
                        <div
                            id="back-item"
                            onClick={contentClick}
                            style={{ width: `100vw`, height: `100vh` }}
                        />
                        <Popover backdrop={backdrop}>
                            <div style={{ width: `100px`, height: `200px` }}></div>
                        </Popover>
                    </Root>
                ),
                { initialData: `none` }
            );

            await click(`#back-item`);

            expect(contentClick, `click through backdrop`).to.have.callCount(1);

            setData(`block`);

            expect(await clickIfPossible(`#back-item`), `not clickable`).to.equal(false);
            expect(contentClick, `click on blocked backdrop`).to.have.callCount(1);
        });
    });
});
