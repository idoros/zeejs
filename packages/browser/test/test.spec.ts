import { expect } from 'chai';
import { zeedom } from '../src';

describe(`browser test`, () => {
    it(`should fail`, () => {
        expect(zeedom).to.not.equal(null);
    });
});
