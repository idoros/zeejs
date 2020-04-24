import { Root, Layer } from '../src';
import { domElementMatchers } from './chai-dom-element';
import { ReactTestDriver } from './react-test-driver';
import React from 'react';
import chai, { expect } from 'chai';
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
});
