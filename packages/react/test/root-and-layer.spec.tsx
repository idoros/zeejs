import { Root, Layer } from '@zeejs/react';
import { domElementMatchers } from './chai-dom-element';
import { ReactTestDriver } from './react-test-driver';
import {
    expectImageSnapshot,
    getInteractionApi,
    expectServerFixture,
} from '@zeejs/test-browser-bridge';
import React from 'react';
import ReactDOM from 'react-dom';
import { waitFor } from 'promise-assist';
import chai, { expect } from 'chai';
import sinon, { stub, spy } from 'sinon';
import sinonChai from 'sinon-chai';
import { act } from 'react-dom/test-utils';
chai.use(sinonChai);
chai.use(domElementMatchers);

describe(`react root-and-layer`, () => {
    let testDriver: ReactTestDriver;
    const { click, clickIfPossible, keyboard, hover } = getInteractionApi();

    before('setup test driver', () => (testDriver = new ReactTestDriver()));
    afterEach('clear test driver', () => {
        testDriver.clean();
        sinon.restore();
    });

    it(`should render main layer`, () => {
        const { container } = testDriver.render(() => (
            <Root>
                <div>content</div>
            </Root>
        ));

        expect(container.textContent).to.equal(`content`);
    });

    it(`should position layer after main layer in DOM`, () => {
        const { expectQuery } = testDriver.render(() => (
            <Root>
                <div id="root-node">
                    <Layer>
                        <div id="layer-node" />
                    </Layer>
                </div>
            </Root>
        ));

        const rootNode = expectQuery(`#root-node`);
        const layerNode = expectQuery(`#layer-node`);

        expect(rootNode, `layer after root`).domElement().preceding(layerNode);
    });

    it(`should render layer after initial render`, () => {
        const { expectQuery, query, setData } = testDriver.render<boolean>(
            (renderLayer) => (
                <Root>
                    <div id="root-node">
                        {renderLayer ? (
                            <Layer>
                                <div id="layer-node" />
                            </Layer>
                        ) : null}
                    </div>
                </Root>
            ),
            {
                initialData: false,
            }
        );

        expect(query(`#layer-node`), `before layer render`).to.not.be.domElement();

        setData(true);

        const rootNode = expectQuery(`#root-node`);
        const layerNode = expectQuery(`#layer-node`);
        expect(rootNode).domElement().preceding(layerNode);
    });

    it(`should remove layer`, () => {
        const { container } = testDriver.render(() => (
            <Root>
                <div id="root-node">
                    <Layer>
                        <div id="layer-node" />
                    </Layer>
                </div>
            </Root>
        ));

        testDriver.render(
            () => (
                <Root>
                    <div id="root-node" />
                </Root>
            ),
            { container }
        );

        const layerNode = container.querySelector(`#layer-node`);
        expect(layerNode, `layer not rendered`).to.equal(null);
        expect(container.firstElementChild?.childElementCount, `only root content`).to.equal(1);
    });

    it(`should render and remove deep nested layer`, () => {
        const { expectQuery, query, setData } = testDriver.render<boolean>(
            (renderLayer) => (
                <Root>
                    <div id="main">
                        <Layer>
                            <div id="shallow">
                                {renderLayer ? (
                                    <Layer>
                                        <div id="deep" />
                                    </Layer>
                                ) : null}
                            </div>
                        </Layer>
                    </div>
                </Root>
            ),
            {
                initialData: false,
            }
        );

        expect(query(`#deep`), `not rendered`).to.not.be.domElement();

        // render deep layer
        setData(true);

        const mainNode = expectQuery(`#main`);
        const shallowNode = expectQuery(`#shallow`);
        const deepNode = expectQuery(`#deep`);
        expect(mainNode, `main before shallow`).domElement().preceding(shallowNode);
        expect(shallowNode, `shallow before deep`).domElement().preceding(deepNode);

        // render without deep layer
        setData(false);

        expect(query(`#deep`), `not rendered`).to.not.be.domElement();
    });

    it(`should place layer relative to window (default)`, () => {
        const { innerWidth, innerHeight } = window;
        const { expectQuery } = testDriver.render(() => (
            <Root>
                <div
                    id="root-node"
                    style={{
                        height: innerHeight * 2,
                        width: innerWidth * 2,
                    }}
                >
                    <Layer>
                        <div id="layer-node" style={{ width: `100%`, height: `100%` }} />
                    </Layer>
                </div>
            </Root>
        ));

        window.scrollTo(innerWidth, innerHeight);

        const layerNode = expectQuery(`#layer-node`);
        expect(layerNode.getBoundingClientRect()).to.include({
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            top: 0,
            left: 0,
        });
    });

    it(`should place layer relative to element`, async () => {
        const { innerWidth, innerHeight } = window;
        const { expectHTMLQuery, container } = testDriver.render(() => (
            <Root>
                <div
                    id="root-node"
                    style={{
                        height: innerHeight * 2,
                        width: innerWidth * 2,
                    }}
                >
                    <div
                        id="relative-node"
                        style={{
                            width: `200px`,
                            height: `100px`,
                            margin: `30px`,
                        }}
                    />
                </div>
            </Root>
        ));
        const relativeNode = expectHTMLQuery(`#relative-node`);

        testDriver.render(
            () => (
                <Root>
                    <div
                        id="root-node"
                        style={{
                            height: innerHeight * 2,
                            width: innerWidth * 2,
                        }}
                    >
                        <div
                            id="relative-node"
                            style={{
                                width: `200px`,
                                height: `100px`,
                                margin: `30px`,
                            }}
                        />
                        <Layer overlap={relativeNode}>
                            <div id="layer-node" style={{ width: `100%`, height: `100%` }} />
                        </Layer>
                    </div>
                </Root>
            ),
            { container }
        );
        window.scrollTo(innerWidth, innerHeight);

        const layerNode = expectHTMLQuery(`#layer-node`);
        await waitFor(() => {
            expect(layerNode.getBoundingClientRect()).to.eql(relativeNode.getBoundingClientRect());
        });
    });

    it(`should hide layer component placeholder inline`, () => {
        const { expectQuery } = testDriver.render(() => (
            <Root>
                <div id="root-node">
                    <span id="before">before</span>
                    <Layer>
                        <div id="layer-node" />
                    </Layer>
                    <span id="after">after</span>
                </div>
            </Root>
        ));

        const before = expectQuery(`#before`);
        const layerPlaceholder = before.nextElementSibling!;
        const after = expectQuery(`#after`);

        expect(layerPlaceholder, `placeholder exist`).domElement();
        expect(layerPlaceholder.getBoundingClientRect(), `zero size`).to.include({
            width: 0,
            height: 0,
        });
        expect(window.getComputedStyle(before).top, `inline`).to.equal(
            window.getComputedStyle(after).top
        );

        layerPlaceholder.innerHTML = `<div style="width: 100px; height: 100px;"></div>`;

        expect(layerPlaceholder.getBoundingClientRect(), `zero size with content`).to.include({
            width: 0,
            height: 0,
        });
    });

    describe(`backdrop`, () => {
        it(`should click through backdrop by default (backdrop="none")`, async () => {
            const contentClick = stub();
            testDriver.render(() => (
                <Root>
                    <div
                        id="back-item"
                        onClick={() => contentClick()}
                        style={{ width: `400px`, height: `400px` }}
                    />
                    <Layer>
                        <span />
                    </Layer>
                </Root>
            ));

            await click(`#back-item`);

            expect(contentClick).to.have.callCount(1);
        });

        it(`should prevent clicks through "block" backdrop`, async () => {
            const contentClick = stub();
            testDriver.render(() => (
                <Root>
                    <div
                        id="back-item"
                        onClick={() => contentClick()}
                        style={{ width: `400px`, height: `400px` }}
                    />
                    <Layer backdrop="block">
                        <span />
                    </Layer>
                </Root>
            ));

            expect(await clickIfPossible(`#back-item`), `not clickable`).to.equal(false);
            expect(contentClick).to.have.callCount(0);
        });

        it(`should prevent clicks on other layers through "block" backdrop`, async () => {
            const contentClick = stub();
            testDriver.render(() => (
                <Root>
                    <Layer backdrop="block">
                        <div
                            id="layer-item"
                            onClick={() => contentClick()}
                            style={{ width: `400px`, height: `400px` }}
                        />
                    </Layer>
                    <Layer backdrop="block">
                        <span />
                    </Layer>
                </Root>
            ));

            expect(await clickIfPossible(`#layer-item`), `not clickable`).to.equal(false);
            expect(contentClick).to.have.callCount(0);
        });

        it(`should click through to other layers with "none" backdrop (default)`, async () => {
            const contentClick = stub();
            testDriver.render(() => (
                <Root>
                    <Layer backdrop="block">
                        <div
                            id="layer-item"
                            onClick={() => contentClick()}
                            style={{ width: `400px`, height: `400px` }}
                        />
                    </Layer>
                    <Layer backdrop="none">
                        <span />
                    </Layer>
                </Root>
            ));

            await click(`#layer-item`);

            expect(contentClick).to.have.callCount(1);
        });

        it(`should hide content behind layer (backdrop="hide")`, async () => {
            const contentClick = stub();
            testDriver.render(() => (
                <Root>
                    <div
                        id="back-item"
                        onClick={() => contentClick()}
                        style={{
                            width: `400px`,
                            height: `400px`,
                            background: `green`,
                        }}
                    />
                    <Layer backdrop="hide">
                        <div
                            style={{
                                width: `200px`,
                                height: `200px`,
                                background: `green`,
                            }}
                        />
                    </Layer>
                </Root>
            ));

            expect(await clickIfPossible(`#back-item`), `not clickable`).to.equal(false);

            expect(contentClick, `background content not clickable`).to.have.callCount(0);
            await expectImageSnapshot({
                filePath: `backdrop/should hide content behind layer (backdrop=hide)`,
            });
        });

        it(`should hide content between layers (backdrop="hide")`, async () => {
            testDriver.render(() => (
                <Root>
                    <div
                        style={{
                            width: `400px`,
                            height: `400px`,
                            background: `green`,
                        }}
                    />
                    <Layer backdrop="hide">
                        <div
                            style={{
                                width: `200px`,
                                height: `200px`,
                                position: `absolute`,
                                right: 0,
                                background: `green`,
                            }}
                        />
                    </Layer>
                    <Layer backdrop="hide">
                        <div
                            style={{
                                width: `100px`,
                                height: `100px`,
                                background: `green`,
                            }}
                        />
                    </Layer>
                </Root>
            ));

            await expectImageSnapshot({
                filePath: `backdrop/should hide content between layer (backdrop=hide)`,
            });
        });
    });

    describe(`focus`, () => {
        it(`should keep layer as part of tab order`, async () => {
            const { expectHTMLQuery } = testDriver.render<boolean>(() => (
                <Root>
                    <input id="bgBeforeInput" />
                    <Layer>
                        <input id="layerInput" />
                    </Layer>
                    <input id="bgAfterInput" />
                </Root>
            ));
            const bgBeforeInput = expectHTMLQuery(`#bgBeforeInput`);
            const layerInput = expectHTMLQuery(`#layerInput`);
            const bgAfterInput = expectHTMLQuery(`#bgAfterInput`);

            bgBeforeInput.focus();
            expect(document.activeElement, `start focus before layer`)
                .domElement()
                .equal(bgBeforeInput);

            await keyboard.press(`Tab`);
            await waitFor(() => {
                expect(document.activeElement, `focus inside layer`).domElement().equal(layerInput); // bgBeforeInput
            }, {timeout: 3000});

            await keyboard.press(`Tab`);
            await waitFor(() => {
                expect(document.activeElement, `focus after layer`).domElement().equal(bgAfterInput);
            }, {timeout: 3000});
        });

        it(`should trap focus in blocking layer`, async () => {
            const { expectHTMLQuery } = testDriver.render<boolean>(() => (
                <Root>
                    <input id="bgBeforeInput" />
                    <Layer backdrop="block">
                        <input id="layerFirstInput" />
                        <input id="layerLastInput" />
                    </Layer>
                    <input id="bgAfterInput" />
                </Root>
            ));
            const layerFirstInput = expectHTMLQuery(`#layerFirstInput`);
            const layerLastInput = expectHTMLQuery(`#layerLastInput`);

            layerLastInput.focus();
            expect(document.activeElement, `start focus in layer`)
                .domElement()
                .equal(layerLastInput);

            await keyboard.press(`Tab`);
            await waitFor(() => {
                expect(document.activeElement, `ignore blocked parent`)
                    .domElement()
                    .equal(layerFirstInput);
            }, {timeout: 3000});
        });

        it(`should re-focus last element of an un-blocked layer`, async () => {
            const warnSpy = spy(console, `warn`);
            const errorSpy = spy(console, `error`);
            const { expectHTMLQuery, setData } = testDriver.render<boolean>(
                (renderLayer) => (
                    <Root>
                        <input id="bgInput" />
                        {renderLayer ? <Layer backdrop="block">layer content</Layer> : null}
                    </Root>
                ),
                { initialData: false }
            );
            const bgInput = expectHTMLQuery(`#bgInput`);
            bgInput.focus();

            setData(true);

            await waitFor(() => {
                expect(document.activeElement, `blocked input blur`)
                    .domElement()
                    .equal(document.body);
            }, {timeout: 3000});

            setData(false);

            await waitFor(() => {
                expect(document.activeElement, `refocus input`).domElement().equal(bgInput);
            }, {timeout: 3000});
            /* blur/re-focus is delayed because React listens for blur of rendered elements during render.
            just check that no logs have been called. */
            expect(warnSpy, `no react warning`).to.have.callCount(0);
            expect(errorSpy, `no react error`).to.have.callCount(0);
        });

        it(`should report on focus change`, async () => {
            const onFocusChange = stub();
            testDriver.render(() => (
                <Root>
                    <input id="root-input" />
                    <Layer onFocusChange={onFocusChange}>
                        <input id="layer-input" style={{ margin: `3em` }} />
                    </Layer>
                </Root>
            ));

            await click(`#layer-input`);

            expect(onFocusChange, `focus in layer`).to.have.been.calledOnceWith(true);
            onFocusChange.reset();

            await click(`#root-input`);

            expect(onFocusChange, `focus out of layer`).to.have.been.calledOnceWith(false);
        });
    });

    describe(`click outside`, () => {
        it(`should invoke onClickOutside handler for click on root`, async () => {
            const onClickOutside = stub();
            testDriver.render(() => (
                <Root>
                    <div
                        id="root-node"
                        style={{ width: `100px`, height: `100px`, background: `green` }}
                    >
                        <Layer onClickOutside={onClickOutside}>
                            <div
                                id="layer-node"
                                style={{ width: `50px`, height: `50px`, background: `red` }}
                            />
                        </Layer>
                    </div>
                </Root>
            ));

            await click(`#root-node`);

            expect(onClickOutside, `click on root`).to.have.callCount(1);

            await click(`#layer-node`);

            expect(onClickOutside, `click on root`).to.have.callCount(1);
        });

        it(`should not invoke onClickOutside handler for nested layer click`, async () => {
            const onClickOutside = stub();
            testDriver.render(() => (
                <Root>
                    <div
                        id="root-node"
                        style={{ width: `100px`, height: `100px`, background: `green` }}
                    >
                        <Layer onClickOutside={onClickOutside}>
                            <div
                                id="shallow-node"
                                style={{ width: `50px`, height: `50px`, background: `orange` }}
                            />
                            <Layer>
                                <div
                                    id="deep-node"
                                    style={{ width: `25px`, height: `25px`, background: `red` }}
                                />
                            </Layer>
                        </Layer>
                    </div>
                </Root>
            ));

            await click(`#deep-node`);

            expect(onClickOutside, `no invocation for nested click`).to.have.callCount(0);
        });
    });

    describe(`mouse inside`, () => {
        it(`should inform layer when mouse enters and leaves`, async () => {
            const onMouseIntersection = stub();
            testDriver.render(() => (
                <Root>
                    <div
                        id="root-node"
                        style={{ width: `100px`, height: `100px`, background: `green` }}
                    >
                        <Layer onMouseIntersection={onMouseIntersection}>
                            <div
                                id="layer-node"
                                style={{ width: `50px`, height: `50px`, background: `red` }}
                            />
                        </Layer>
                    </div>
                </Root>
            ));

            await hover(`#layer-node`);

            await waitFor(() => {
                expect(onMouseIntersection, `catch mouse inside layer`).to.have.callCount(1);
                expect(onMouseIntersection, `called with true`).to.have.been.calledWith(true);
            });
            onMouseIntersection.reset();

            await hover(`#root-node`);

            await waitFor(() => {
                expect(onMouseIntersection, `catch mouse outside layer`).to.have.callCount(1);
                expect(onMouseIntersection, `called with false`).to.have.been.calledWith(false);
            });
        });
    });

    describe(`server rendering`, () => {
        it(`should render root on server and connect in browser`, async () => {
            const warnSpy = spy(console, `warn`);
            const errorSpy = spy(console, `error`);
            const container = document.createElement(`div`);
            document.body.appendChild(container);

            container.innerHTML = await expectServerFixture({
                fixtureFileName: `render-root`,
            });

            act(() => {
                ReactDOM.hydrate(<Root>content</Root>, container);
            });

            expect(container.textContent).to.equal(`content`);
            expect(warnSpy, `no react warning`).to.have.callCount(0);
            expect(errorSpy, `no react error`).to.have.callCount(0);
            document.body.removeChild(container);
        });

        it(`should render layers nested and flattened in browser`, async () => {
            const warnSpy = spy(console, `warn`);
            const errorSpy = spy(console, `error`);
            const container = document.createElement(`div`);
            document.body.appendChild(container);

            container.innerHTML = await expectServerFixture({
                fixtureFileName: `render-layer`,
            });

            let rootNode = testDriver.expectHTMLQuery(container, `#root-node`);
            let layerNode = testDriver.expectHTMLQuery(container, `#layer-node`);
            expect(rootNode, `root exist in string`).domElement();
            expect(rootNode, `layer inside root before client render`)
                .domElement()
                .contains(layerNode);

            act(() => {
                ReactDOM.hydrate(
                    <Root>
                        <div id="root-node">
                            <Layer>
                                <div id="layer-node" />
                            </Layer>
                        </div>
                    </Root>,
                    container
                );
            });

            rootNode = testDriver.expectHTMLQuery(container, `#root-node`);
            layerNode = testDriver.expectHTMLQuery(container, `#layer-node`);
            expect(layerNode, `layer exist after client render`).domElement();
            expect(rootNode, `layer after root`).domElement().preceding(layerNode);
            expect(warnSpy, `no react warning`).to.have.callCount(0);
            expect(errorSpy, `no react error`).to.have.callCount(0);
            document.body.removeChild(container);
        });
    });
});
