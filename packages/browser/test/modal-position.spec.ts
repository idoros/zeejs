import { modalAbsolutePositionAsString } from '../src';
import { HTMLTestDriver } from './html-test-driver';
import { expect } from 'chai';

describe(`modal-position`, () => {
    let testDriver: HTMLTestDriver;

    before('setup test driver', () => (testDriver = new HTMLTestDriver()));
    afterEach('clear test driver', () => testDriver.clean());

    const cases = [
        { position: `center`, expected: { top: 200, left: 200 } },
        { position: `top`, expected: { top: 0, left: 200 } },
        { position: `topRight`, expected: { top: 0, left: 400 } },
        { position: `right`, expected: { top: 200, left: 400 } },
        { position: `bottomRight`, expected: { top: 400, left: 400 } },
        { position: `bottom`, expected: { top: 400, left: 200 } },
        { position: `bottomLeft`, expected: { top: 400, left: 0 } },
        { position: `left`, expected: { top: 200, left: 0 } },
        { position: `topLeft`, expected: { top: 0, left: 0 } },
    ] as const;

    for (const { position, expected } of cases) {
        it(`should align to ${position}`, () => {
            const alignStyle = modalAbsolutePositionAsString(position);

            const { expectHTMLQuery } = testDriver.render(
                () => `
            <div style="position: fixed; width: 500px; height: 500px;">
                <div id="modal" style="${alignStyle}">
                    <div style="width: 100px; height: 100px;"></div>
                </div>
            </div>
        `
            );

            const bounds = expectHTMLQuery(`#modal`).getBoundingClientRect();
            expect(bounds, `center position`).to.contain(expected);
        });
    }
});
