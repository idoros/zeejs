import { Root, Layer } from '../src';
import { domElementMatchers } from './chai-dom-element';
import { ReactTestDriver } from './react-test-driver';
import { expectImageSnapshot } from '@zeejs/test-browser/browser';
import React from 'react';
import chai, { expect } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
chai.use(domElementMatchers);

describe(`react`, () => {
    let testDriver: ReactTestDriver;

    before('setup test driver', () => (testDriver = new ReactTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

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

    it(`should place layer relative to element`, () => {
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
        expect(layerNode.getBoundingClientRect()).to.eql(relativeNode.getBoundingClientRect());
    });

    describe(`backdrop`, () => {
        it(`should click through backdrop by default (backdrop="none")`, () => {
            const contentClick = stub();
            const { click } = testDriver.render(() => (
                <Root>
                    <div
                        id="back-item"
                        onClick={contentClick}
                        style={{ width: `400px`, height: `400px` }}
                    />
                    <Layer>
                        <span />
                    </Layer>
                </Root>
            ));

            click(`#back-item`);

            expect(contentClick).to.have.callCount(1);
        });

        it(`should prevent clicks through "block" backdrop`, () => {
            const contentClick = stub();
            const { click } = testDriver.render(() => (
                <Root>
                    <div
                        id="back-item"
                        onClick={contentClick}
                        style={{ width: `400px`, height: `400px` }}
                    />
                    <Layer backdrop="block">
                        <span />
                    </Layer>
                </Root>
            ));

            click(`#back-item`);

            expect(contentClick).to.have.callCount(0);
        });

        it(`should prevent clicks on other layers through "block" backdrop`, () => {
            const contentClick = stub();
            const { click } = testDriver.render(() => (
                <Root>
                    <Layer backdrop="block">
                        <div
                            id="layer-item"
                            onClick={contentClick}
                            style={{ width: `400px`, height: `400px` }}
                        />
                    </Layer>
                    <Layer backdrop="block">
                        <span />
                    </Layer>
                </Root>
            ));

            click(`#layer-item`);

            expect(contentClick).to.have.callCount(0);
        });

        it(`should click through to other layers with "none" backdrop (default)`, () => {
            const contentClick = stub();
            const { click } = testDriver.render(() => (
                <Root>
                    <Layer backdrop="block">
                        <div
                            id="layer-item"
                            onClick={contentClick}
                            style={{ width: `400px`, height: `400px` }}
                        />
                    </Layer>
                    <Layer backdrop="none">
                        <span />
                    </Layer>
                </Root>
            ));

            click(`#layer-item`);

            expect(contentClick).to.have.callCount(1);
        });

        it(`should hide content behind layer (backdrop="hide")`, async () => {
            const contentClick = stub();
            const { click } = testDriver.render(() => (
                <Root>
                    <div
                        id="back-item"
                        onClick={contentClick}
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

            click(`#back-item`);

            expect(contentClick, `background content not clickable`).to.have.callCount(0);
            await expectImageSnapshot({
                filePath: `backdrop/should hide content behind layer (backdrop=hide)`,
            });
        });

        it(`should hide content between layer (backdrop="hide")`, async () => {
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
});
