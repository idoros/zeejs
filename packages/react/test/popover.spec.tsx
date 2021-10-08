import { Root, Popover, OverlayPosition } from '@zeejs/react';
import { domElementMatchers } from './chai-dom-element';
import { ReactTestDriver } from './react-test-driver';
import React from 'react';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { waitFor } from 'promise-assist';
chai.use(sinonChai);
chai.use(domElementMatchers);

describe(`react popover`, () => {
    let testDriver: ReactTestDriver;

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
});
