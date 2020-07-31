import { Root } from '../src';
import { Box } from './box';
import { ModalDemo } from './demos/modal-demo';
import { TooltipDemo } from './demos/tooltip-demo';
import React from 'react';
import ReactDOM from 'react-dom';

const wrapper = document.createElement(`div`);
document.body.appendChild(wrapper);
const globalCSS = document.createElement(`style`);
globalCSS.innerHTML = `
    body {
        margin: 0;
        --layerShadow: 3px 3px 7px 2px #404040;
    }
    header {
        position: sticky;
        top: 0;
        text-align: center;
        background: rgba(255, 255, 255, 0.8);
    }
    .resetButton {
        border: none;
        margin: 0;
        padding: 0;
        width: auto;
        overflow: visible;
        background: transparent;
        cursor: pointer;
        /* inherit font & color from ancestor */
        color: inherit;
        font: inherit;
        /* Normalize "line-height". Cannot be changed from "normal" in Firefox 4+. */
        line-height: normal;
        /* Corrects font smoothing for webkit */
        -webkit-font-smoothing: inherit;
        -moz-osx-font-smoothing: inherit;
        /* Corrects inability to style clickable "input" types in iOS */
        -webkit-appearance: none;
    }
    .resetButton[disabled] {
        cursor: default;
    }

    :focus {
        outline: 5px solid gold;
    }
    .backgroundText {
        color: grey;
        user-select: none;
    }
    .App__demoBox {
        margin: 1em auto;
        max-width: 50vw;
        text-align: center;
        border: 2px solid #6d6d6d;
        border-radius: 10px;
        padding: 1em;
    }
    .App__demoBox > form {
        display: inline-grid;
        grid-template-columns: auto auto;
        text-align: left;
        grid-gap: 0.5em;
    }
    .App__demoBox > form > button[type="submit"] {
        grid-column-start: 1;
        grid-column-end: 3;
    }

    .ModalDemo--fixedSize {
        min-width: 30vw;
        min-height: 30vh;
    }
    .ModalDemo__modalContainer {
        display: grid;
        grid-template-rows: auto 1fr auto;
    }
    .ModalDemo__shrinkable {
        overflow: auto;
    }

    .Modal__root {
        display: grid;
        grid-template-rows: minmax(0, 1fr);
        grid-template-columns: minmax(0, 1fr);
        max-height: 100vh;
        max-width: 100vw;
    }
    .Modal__root > .Box__root {
        padding: 1em;
    }
    .Dialog__root {
        display: inline-block;
    }
    .Dialog__root {
        box-shadow: var(--layerShadow);
    }
    .Dialog__root:not(.Dialog--positioned), .Dialog__root:not(.Dialog--positioned) * {
        visibility: hidden!important;
    }
    .Box--shadow {
        box-shadow: var(--layerShadow);
    }
    .PositionInputButton__root {
        background: white;
        border: 1px solid rgb(118, 118, 118);
    }
    .PositionInput__root {
        display: inline-grid;
        grid-template-columns: repeat(3, auto);
    }
    .PositionInput__btn {}
    .PositionInput__btn:focus {
        position: relative;
    }
    .PositionInput__btn--checked {
        background: gold;
    }
`;
document.body.append(globalCSS);

const Demos = () => {
    return (
        <>
            <div className="App__demoBox">
                <ModalDemo>
                    <Demos />
                </ModalDemo>
                <hr />
                <TooltipDemo />
            </div>
        </>
    );
};

ReactDOM.render(
    <Root>
        <header>
            <h1>zeejs React demo</h1>
        </header>
        <Box style={{ padding: `1em` }}>
            <Demos />
            <span aria-hidden="true" className="backgroundText">
                {Array.from({ length: 3000 }, () => `main layer`).join(` `)}
            </span>
        </Box>
    </Root>,
    wrapper
);
