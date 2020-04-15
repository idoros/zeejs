import { expect } from 'chai';
import { createLayer } from '../src';

describe(`core test`, () => {
    it(`should fail`, () => {
        expect(createLayer).to.equal(true);
    });
});
