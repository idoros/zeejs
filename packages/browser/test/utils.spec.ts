import { isContainedBy } from '@zeejs/browser';
import { HTMLTestDriver } from './html-test-driver';
import { expect } from 'chai';

describe(`utils`, () => {
    let testDriver: HTMLTestDriver;

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    describe(`isContainedBy`, () => {
        it(`should be true for element contained under another element`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <div id="container">
                    <div>
                        <div id="inner"></div>
                    </div>
                </div>
            `
            );
            const inner = expectHTMLQuery(`#inner`);
            const container = expectHTMLQuery(`#container`);

            const isContained = isContainedBy(inner, container);

            expect(isContained).to.equal(true);
        });

        it(`should be false for element not contained under another element`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <div id="container"></div>
                <div id="inner"></div>
            `
            );
            const inner = expectHTMLQuery(`#inner`);
            const container = expectHTMLQuery(`#container`);

            const isContained = isContainedBy(inner, container);

            expect(isContained).to.equal(false);
        });

        it(`should be true for element contained in a layer under container`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <zeejs-layer>
                    <div id="container">
                        <zeejs-origin data-origin="layerA" tabIndex="0">
                    </div>
                </zeejs-layer>
                <zeejs-layer id="layerA">
                    <zeejs-origin data-origin="layerB" tabIndex="0">
                </zeejs-layer>
                <zeejs-layer id="layerB">
                    <div>
                        <div id="inner"></div>
                    </div>
                </zeejs-layer>
            `
            );
            const inner = expectHTMLQuery(`#inner`);
            const container = expectHTMLQuery(`#container`);

            const isContained = isContainedBy(inner, container);

            expect(isContained).to.equal(true);
        });

        it(`should be false for missing layer origin`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <zeejs-layer>
                    <div id="container">
                        <zeejs-origin data-origin="layerA" tabIndex="0">
                    </div>
                </zeejs-layer>
                <zeejs-layer id="layerB">
                    <div>
                        <div id="inner"></div>
                    </div>
                </zeejs-layer>
            `
            );
            const inner = expectHTMLQuery(`#inner`);
            const container = expectHTMLQuery(`#container`);

            const isContained = isContainedBy(inner, container);

            expect(isContained).to.equal(false);
        });

        it(`should be true when element equals contained`, () => {
            const { expectHTMLQuery } = testDriver.render(
                () => `
                <div id="inner"></div>
            `
            );
            const inner = expectHTMLQuery(`#inner`);

            const isContained = isContainedBy(inner, inner);

            expect(isContained).to.equal(true);
        });
    });
});
