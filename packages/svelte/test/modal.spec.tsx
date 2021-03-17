import * as zeejsSvelte from '../src';
import { SvelteTestDriver } from './svelte-test-driver';
import { getInteractionApi } from '@zeejs/test-browser-bridge';
import { expect } from 'chai';
import sinon, { stub } from 'sinon';
import { waitFor } from 'promise-assist';

describe(`svelte modal`, () => {
    let testDriver: SvelteTestDriver;
    const { clickIfPossible, click, hover } = getInteractionApi();

    before(
        'setup test driver',
        () =>
            (testDriver = new SvelteTestDriver({
                '@zeejs/svelte': zeejsSvelte,
            }))
    );
    afterEach('clear test driver', () => {
        testDriver.clean();
        sinon.restore();
    });

    describe(`position`, () => {
        it(`should be centered by default`, () => {
            const { expectQuery } = testDriver.render(`
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                </script>
                <Root>
                    <Modal>
                        <div id="modalContent" style="width: 100px; height: 200px;"></div>
                    </Modal>
                </Root>
            `);

            const modalContent = expectQuery(`#modalContent`);
            const modalBounds = modalContent.getBoundingClientRect();
            const { clientWidth, clientHeight } = document.documentElement;
            expect(modalBounds.x, `x`).to.be.approximately(
                clientWidth / 2 - modalBounds.width / 2,
                1
            );
            expect(modalBounds.y, `y`).to.be.approximately(
                clientHeight / 2 - modalBounds.height / 2,
                1
            );
        });
        it(`should be fixed to window and not move on scroll`, () => {
            const { expectQuery } = testDriver.render(`
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                </script>
                <Root>
                    <div style="width: 200vw; height: 200vh;"></div>
                    <Modal>
                        <div id="modalContent" style="width: 100px; height: 200px;"></div>
                    </Modal>
                </Root>
            `);
            const { clientWidth, clientHeight } = document.documentElement;
            document.body.scrollBy(clientWidth, clientHeight);

            const modalContent = expectQuery(`#modalContent`);
            const modalBounds = modalContent.getBoundingClientRect();
            expect(modalBounds.x, `x`).to.be.approximately(
                clientWidth / 2 - modalBounds.width / 2,
                1
            );
            expect(modalBounds.y, `y`).to.be.approximately(
                clientHeight / 2 - modalBounds.height / 2,
                1
            );
        });
        it(`should accept custom position`, () => {
            const { expectQuery } = testDriver.render(`
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                </script>
                <Root>
                    <Modal position="bottomRight">
                        <div id="modalContent" style="width: 100px; height: 200px;"></div>
                    </Modal>
                </Root>
            `);

            const modalContent = expectQuery(`#modalContent`);
            const modalBounds = modalContent.getBoundingClientRect();
            const { clientWidth, clientHeight } = document.documentElement;
            expect(modalBounds.x, `x`).to.be.approximately(clientWidth - modalBounds.width, 1);
            expect(modalBounds.y, `y`).to.be.approximately(clientHeight - modalBounds.height, 1);
        });
        it(`should update position on prop change`, async () => {
            const { expectQuery, updateProps } = testDriver.render(
                `
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                    export let position;
                </script>
                <Root>
                    <Modal position={position}>
                        <div id="modalContent" style="width: 100px; height: 200px;"></div>
                    </Modal>
                </Root>
            `,
                { position: `left` }
            );

            const { clientWidth, clientHeight } = document.documentElement;
            const modalContent = expectQuery(`#modalContent`);
            let modalBounds = modalContent.getBoundingClientRect();
            expect(modalBounds.x, `initial x`).to.be.approximately(0, 1);
            expect(modalBounds.y, `initial y`).to.be.approximately(
                clientHeight / 2 - modalBounds.height / 2,
                1
            );

            updateProps({ position: `topRight` });

            await waitFor(() => {
                modalBounds = modalContent.getBoundingClientRect();
                expect(modalBounds.x, `modified x`).to.be.approximately(
                    clientWidth - modalBounds.width,
                    1
                );
                expect(modalBounds.y, `modified y`).to.be.approximately(0, 1);
            });
        });
    });
    describe(`backdrop`, () => {
        it(`should default to blocking background`, async () => {
            const contentClick = stub();
            testDriver.render(
                `
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                    export let contentClick;
                </script>
                <Root>
                    <div
                        id="back-item"
                        on:click={contentClick}
                        style="width: 100vw; height: 100vh;"
                    />
                    <Modal position="bottomRight">
                        <div id="modalContent" style="width: 100px; height: 200px;"></div>
                    </Modal>
                </Root>
            `,
                { contentClick }
            );

            expect(await clickIfPossible(`#back-item`), `not clickable`).to.equal(false);
            expect(contentClick).to.have.callCount(0);
        });
        it(`should accept custom backdrop`, async () => {
            const contentClick = stub();
            testDriver.render(
                `
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                    export let contentClick;
                </script>
                <Root>
                    <div
                        id="back-item"
                        on:click={contentClick}
                        style="width: 100vw; height: 100vh;"
                    />
                    <Modal backdrop="none" position="bottomRight">
                        <div id="modalContent" style="width: 100px; height: 200px;"></div>
                    </Modal>
                </Root>
            `,
                { contentClick }
            );

            await click(`#back-item`);

            expect(contentClick).to.have.callCount(1);
        });
        it.skip(`should update backdrop on prop change`, async () => {
            const contentClick = stub();
            const { updateProps } = testDriver.render(
                `
                    <script>
                        import {Root, Modal} from '@zeejs/svelte';
                        export let contentClick;
                    </script>
                    <Root>
                        <div
                            id="back-item"
                            on:click={contentClick}
                            style="width: 100vw; height: 100vh;"
                        />
                        <Modal backdrop="none" position="bottomRight">
                            <div id="modalContent" style="width: 100px; height: 200px;"></div>
                        </Modal>
                    </Root>
                `,
                { contentClick }
            );

            await click(`#back-item`);

            expect(contentClick, `click through backdrop`).to.have.callCount(1);

            updateProps({ backdrop: `block` });

            expect(await clickIfPossible(`#back-item`), `not clickable`).to.equal(false);
            expect(contentClick, `click on blocked backdrop`).to.have.callCount(1);
        });
    });
    describe(`display`, () => {
        it(`should display modal by default`, () => {
            const { query } = testDriver.render(`
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                </script>
                <Root>
                    <Modal>
                        <div id="modalContent"></div>
                    </Modal>
                </Root>
            `);

            const modalContent = query(`#modalContent`);
            expect(modalContent, `rendered to DOM`).to.be.instanceOf(HTMLDivElement);
        });
        it(`should not render layer with "show=false"`, () => {
            const { query } = testDriver.render(`
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                </script>
                <Root>
                    <Modal show={false}>
                        <div id="modalContent"></div>
                    </Modal>
                </Root>
            `);

            const modalContent = query(`#modalContent`);
            expect(modalContent, `rendered to DOM`).to.equal(null);
        });
    });
    describe(`interactions`, () => {
        it(`should invoke onClickOutside when clicking out of modal`, async () => {
            const onClickOutside = stub();
            testDriver.render(
                `
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                    export let onClickOutside;
                </script>
                <Root>
                    <div
                        id="root-node"
                        style="width: 100px; height: 100px; background: green;"
                    >
                    <Modal onClickOutside={onClickOutside} position="topRight">
                        <div id="modalContent" style="width: 50px; height: 50px; background: red;"></div>
                    </Modal>
                </Root>
            `,
                { onClickOutside }
            );

            await click(`#root-node`, { force: true });

            expect(onClickOutside, `click on root`).to.have.callCount(1);

            await click(`#modalContent`);

            expect(onClickOutside, `click on root`).to.have.callCount(1);
        });
        it(`should invoke onFocusChange when focus moves in and out of modal`, async () => {
            const onFocusChange = stub();
            testDriver.render(
                `
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                    export let onFocusChange;
                </script>
                <Root>
                    <input id="root-input" />
                    <Modal onFocusChange={onFocusChange} backdrop="none">
                        <input id="layer-input" style="margin: 3em;" />
                    </Modal>
                </Root>
            `,
                { onFocusChange }
            );

            await click(`#layer-input`);

            expect(onFocusChange, `focus in layer`).to.have.been.calledOnceWith(true);
            onFocusChange.reset();

            await click(`#root-input`);

            expect(onFocusChange, `focus out of layer`).to.have.been.calledOnceWith(false);
        });
        it(`should invoke onMouseIntersection when mouse enters and leaves`, async () => {
            const onMouseIntersection = stub();
            testDriver.render(
                `
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                    export let onMouseIntersection;
                </script>
                <Root>
                    <div id="root-node" style="width: 100px, height: 100px, background: green;">
                        <Modal onMouseIntersection={onMouseIntersection} backdrop="none">
                            <div
                                id="layer-node"
                                style="width: 50px; height: 50px; background: red;"
                            />
                        </Modal>
                    </div>
                </Root>
            `,
                { onMouseIntersection }
            );

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
    describe(`style`, () => {
        it(`should pass CSS class`, () => {
            const { expectQuery } = testDriver.render(`
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                </script>
                <style>
                    :global(.modal-custom-class) {
                        width: 200px;
                        height: 300px;
                    }
                </style>
                <Root>
                    <Modal class="modal-custom-class">
                        <div id="modalContent" style="width: 100%; height: 100%;"></div>
                    </Modal>
                </Root>
            `);

            const modalContent = expectQuery(`#modalContent`);
            const modalBounds = modalContent.getBoundingClientRect();
            expect(modalBounds).to.contain({
                width: 200,
                height: 300,
            });
        });
        it(`should pass CSS style`, () => {
            const { expectQuery } = testDriver.render(`
                <script>
                    import {Root, Modal} from '@zeejs/svelte';
                </script>
                <Root>
                    <Modal style="width: 200px; height: 300px;">
                        <div id="modalContent" style="width: 100%; height: 100%;"></div>
                    </Modal>
                </Root>
            `);

            const modalContent = expectQuery(`#modalContent`);
            const modalBounds = modalContent.getBoundingClientRect();
            expect(modalBounds).to.contain({
                width: 200,
                height: 300,
            });
        });
    });
});
