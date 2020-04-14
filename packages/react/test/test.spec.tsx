import { zeereact } from '../src';
import React from 'react';
import ReactDom from 'react-dom';
import { expect } from 'chai';

describe(`react test`, () => {
    it(`should pass`, () => {
        const wrapper = document.createElement(`div`);
        document.body.appendChild(wrapper);
        ReactDom.render(<div>{zeereact.toString()}</div>, wrapper);
        expect(wrapper.firstElementChild!.innerHTML).to.equal(`true`);
    });
});
