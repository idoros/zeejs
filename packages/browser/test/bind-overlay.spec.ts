import { bindOverlay } from '../src';
import { HTMLTestDriver } from './html-test-driver';
import { expect } from 'chai';
import { waitFor } from 'promise-assist';

describe(`browser test`, () => {
    let testDriver: HTMLTestDriver;

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    it(`should overlay an element position and size`, () => {
        const { expectQuery, expectHTMLQuery } = testDriver.render(
            () => `
            <div id="reference" style="width: 100px; height: 200px; margin: 30px"></div>
            <div id="overlay" />
        `
        );
        const reference = expectQuery(`#reference`);
        const overlay = expectHTMLQuery(`#overlay`);

        const { stop } = bindOverlay(reference, overlay);

        expect(overlay.getBoundingClientRect(), `position and size sync`).to.eql(
            reference.getBoundingClientRect()
        );

        stop();
    });

    it(`should keep overlay position on scroll (forced)`, () => {
        const { expectQuery, expectHTMLQuery } = testDriver.render(
            () => `
            <div id="box" style="height: 100px; overflow: scroll;">
                <div id="reference" style="width: 100px; height: 200px; margin: 30px"></div>
            </div>
            <div id="overlay" />
        `
        );
        const reference = expectQuery(`#reference`);
        const overlay = expectHTMLQuery(`#overlay`);
        const { forceUpdate, stop } = bindOverlay(reference, overlay);

        expectQuery(`#box`).scrollTop = 100;
        forceUpdate();

        expect(overlay.getBoundingClientRect()).to.eql(reference.getBoundingClientRect());

        stop();
    });

    it(`should keep overlay position on scroll (async)`, async () => {
        const { expectQuery, expectHTMLQuery } = testDriver.render(
            () => `
            <div id="box" style="height: 100px; overflow: scroll;">
                <div id="reference" style="width: 100px; height: 200px; margin: 30px"></div>
            </div>
            <div id="overlay" />
        `
        );
        const reference = expectQuery(`#reference`);
        const overlay = expectHTMLQuery(`#overlay`);
        const { stop } = bindOverlay(reference, overlay);

        expectQuery(`#box`).scrollTop = 100;

        await waitFor(() => {
            expect(overlay.getBoundingClientRect()).to.eql(reference.getBoundingClientRect());
        });

        stop();
    });
});
