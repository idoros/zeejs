import * as zeejsSvelte from '../src';
import { domElementMatchers } from './chai-dom-element';
import { SvelteTestDriver } from './svelte-test-driver';
import { expectImageSnapshot, getInteractionApi } from '@zeejs/test-browser/browser';
import chai, { expect } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
chai.use(domElementMatchers);

describe(`svelte`, () => {
    let testDriver: SvelteTestDriver;
    const { click, clickIfPossible, keyboard } = getInteractionApi();

    before('setup test driver', () => {
        testDriver = new SvelteTestDriver({
            '@zeejs/svelte': zeejsSvelte,
        });
    });
    afterEach('clear test driver', () => testDriver.clean());

    it(`should render main layer`, () => {
        const { container } = testDriver.render(`
            <script>
                import {Root} from '@zeejs/svelte';
            </script>
            <Root>
                <div>content</div>
            </Root>
        `);

        expect(container.textContent).to.equal(`content`);
    });

    it(`should position layer after main layer in DOM`, () => {
        const { expectQuery } = testDriver.render(`
            <script>
                import {Root, Layer} from '@zeejs/svelte';
            </script>
            <Root>
                <div id="root-node">
                    <Layer>
                        <div id="layer-node" />
                    </Layer>
                </div>
            </Root>
        `);

        const rootNode = expectQuery(`#root-node`);
        const layerNode = expectQuery(`#layer-node`);

        expect(rootNode, `layer after root`).domElement().preceding(layerNode);
    });

    it(`should render layer after initial render`, async () => {
        const { expectQuery, query, updateProps } = testDriver.render(`
            <script>
                import {Root, Layer} from '@zeejs/svelte';
                export let renderLayer = false;
            </script>
            <Root>
                <div id="root-node">
                    {#if renderLayer}
                        <Layer>
                            <div id="layer-node" />
                        </Layer>
                    {/if}
                </div>
            </Root>
        `);

        expect(query(`#layer-node`), `before layer render`).to.not.be.domElement();

        await updateProps({ renderLayer: true });

        const rootNode = expectQuery(`#root-node`);
        const layerNode = expectQuery(`#layer-node`);
        expect(rootNode).domElement().preceding(layerNode);
    });

    it(`should remove layer`, async () => {
        const { container, updateProps } = testDriver.render(`
            <script>
                import {Root, Layer} from '@zeejs/svelte';
                export let renderLayer = true;
            </script>
            <Root>
                <div id="root-node">
                    {#if renderLayer}
                        <Layer>
                            <div id="layer-node" />
                        </Layer>
                    {/if}
                </div>
            </Root>
        `);

        await updateProps({ renderLayer: false });

        const layerNode = container.querySelector(`#layer-node`);
        expect(layerNode, `layer not rendered`).to.equal(null);
        expect(container.firstElementChild?.childElementCount, `only root content`).to.equal(1);
    });

    it(`should render and remove deep nested layer`, async () => {
        const { updateProps, query, expectQuery } = testDriver.render(`
            <script>
                import {Root, Layer} from '@zeejs/svelte';
                export let renderLayer = false;
            </script>
            <Root>
                <div id="main">
                    <Layer>
                        <div id="shallow">
                            {#if renderLayer}
                                <Layer>
                                    <div id="deep" />
                                </Layer>
                            {/if}
                        </div>
                    </Layer>
                </div>
            </Root>
        `);

        expect(query(`#deep`), `not rendered`).to.not.be.domElement();

        // render deep layer
        await updateProps({ renderLayer: true });

        const mainNode = expectQuery(`#main`);
        const shallowNode = expectQuery(`#shallow`);
        const deepNode = expectQuery(`#deep`);
        expect(mainNode, `main before shallow`).domElement().preceding(shallowNode);
        expect(shallowNode, `shallow before deep`).domElement().preceding(deepNode);

        // render without deep layer
        await updateProps({ renderLayer: false });

        expect(query(`#deep`), `not rendered`).to.not.be.domElement();
    });

    it(`should place layer relative to window (default)`, () => {
        const { innerWidth, innerHeight } = window;
        const { expectQuery } = testDriver.render(`
            <script>
                import {Root, Layer} from '@zeejs/svelte';
            </script>
            <Root>
                <div
                    id="root-node"
                    style="height: 200vh; width: 200vw;"
                >
                    <Layer>
                        <div id="layer-node" style="width: 100%; height: 100%;" />
                    </Layer>
                </div>
            </Root>
        `);

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
        const { expectHTMLQuery } = testDriver.render(`
            <script>
                import {Root, Layer} from '@zeejs/svelte';
                let relativeNode;
            </script>
            <Root>
                <div
                    id="root-node"
                    style="height: 200vh; width: 200vw;"
                >
                    <div
                        bind:this={relativeNode}
                        id="relative-node"
                        style="width: 200px; height: 100px; margin: 30px;"
                    />
                    {#if relativeNode}
                        <Layer overlap={relativeNode}>
                            <div id="layer-node" style="width: 100%; height: 100%;" />
                        </Layer>
                    {/if}
                </div>
            </Root>
        `);
        const relativeNode = expectHTMLQuery(`#relative-node`);

        window.scrollTo(innerWidth, innerHeight);

        const layerNode = expectHTMLQuery(`#layer-node`);
        expect(layerNode.getBoundingClientRect()).to.eql(relativeNode.getBoundingClientRect());
    });

    describe(`backdrop`, () => {
        it(`should click through backdrop by default (backdrop="none")`, async () => {
            const contentClick = stub();
            testDriver.render(
                `
                <script>
                    import {Root, Layer} from '@zeejs/svelte';
                    export let contentClick;
                </script>
                <Root>
                    <div
                        id="back-item"
                        on:click={contentClick}
                        style="width: 400px; height: 400px;"
                    />
                    <Layer>
                        <span />
                    </Layer>
                </Root>
            `,
                { contentClick }
            );

            await click(`#back-item`);

            expect(contentClick).to.have.callCount(1);
        });

        it(`should prevent clicks through "block" backdrop`, async () => {
            const contentClick = stub();
            testDriver.render(
                `
                <script>
                    import {Root, Layer} from '@zeejs/svelte';
                    export let contentClick;
                </script>
                <Root>
                    <div
                        id="back-item"
                        on:click={contentClick}
                        style="width: 400px; height: 400px;"
                    />
                    <Layer backdrop="block">
                        <span />
                    </Layer>
                </Root>
            `,
                { contentClick }
            );

            expect(await clickIfPossible(`#back-item`), `not clickable`).to.equal(false);
            expect(contentClick).to.have.callCount(0);
        });

        it(`should prevent clicks on other layers through "block" backdrop`, async () => {
            const contentClick = stub();
            testDriver.render(
                `
                <script>
                    import {Root, Layer} from '@zeejs/svelte';
                    export let contentClick;
                </script>
                <Root>
                    <Layer backdrop="block">
                        <div
                            id="layer-item"
                            on:click={contentClick}
                            style="width: 400px; height: 400px;"
                        />
                    </Layer>
                    <Layer backdrop="block">
                        <span />
                    </Layer>
                </Root>
            `,
                { contentClick }
            );

            expect(await clickIfPossible(`#layer-item`), `not clickable`).to.equal(false);
            expect(contentClick).to.have.callCount(0);
        });

        it(`should click through to other layers with "none" backdrop (default)`, async () => {
            const contentClick = stub();
            testDriver.render(
                `
                <script>
                    import {Root, Layer} from '@zeejs/svelte';
                    export let contentClick;
                </script>
                <Root>
                    <Layer backdrop="block">
                        <div
                            id="layer-item"
                            on:click={contentClick}
                            style="width: 400px; height: 400px;"
                        />
                    </Layer>
                    <Layer backdrop="none">
                        <span />
                    </Layer>
                </Root>
            `,
                { contentClick }
            );

            await click(`#layer-item`);

            expect(contentClick).to.have.callCount(1);
        });

        it(`should hide content behind layer (backdrop="hide")`, async () => {
            const contentClick = stub();
            testDriver.render(
                `
                <script>
                    import {Root, Layer} from '@zeejs/svelte';
                    export let contentClick;
                </script>
                <Root>
                    <div
                        id="back-item"
                        on:click={contentClick}
                        style="width: 400px; height: 400px; background: green;"
                    />
                    <Layer backdrop="hide">
                        <div
                            style="width: 200px; height: 200px; background: green;"
                        />
                    </Layer>
                </Root>
            `,
                { contentClick }
            );

            expect(await clickIfPossible(`#back-item`), `not clickable`).to.equal(false);

            expect(contentClick, `background content not clickable`).to.have.callCount(0);
            await expectImageSnapshot({
                filePath: `backdrop/should hide content behind layer (backdrop=hide)`,
            });
        });

        it(`should hide content between layers (backdrop="hide")`, async () => {
            testDriver.render(`
                <script>
                    import {Root, Layer} from '@zeejs/svelte';
                </script>
                <Root>
                    <div
                        style="width: 400px; height: 400px; background: green;"
                    />
                    <Layer backdrop="hide">
                        <div
                            style="width: 200px; height: 200px; position: absolute; right: 0; background: green;"
                        />
                    </Layer>
                    <Layer backdrop="hide">
                        <div
                            style="width: 100px; height: 100px; background: green;"
                        />
                    </Layer>
                </Root>
            `);

            await expectImageSnapshot({
                filePath: `backdrop/should hide content between layer (backdrop=hide)`,
            });
        });
    });

    describe(`focus`, () => {
        it(`should keep layer as part of tab order`, async () => {
            const { expectHTMLQuery } = testDriver.render(`
                <script>
                    import {Root, Layer} from '@zeejs/svelte';
                </script>
                <Root>
                    <input id="bgBeforeInput" />
                    <Layer>
                        <input id="layerInput" />
                    </Layer>
                    <input id="bgAfterInput" />
                </Root>
            `);
            const bgBeforeInput = expectHTMLQuery(`#bgBeforeInput`);
            const layerInput = expectHTMLQuery(`#layerInput`);
            const bgAfterInput = expectHTMLQuery(`#bgAfterInput`);

            bgBeforeInput.focus();
            expect(document.activeElement, `start focus before layer`).to.equal(bgBeforeInput);

            await keyboard.press(`Tab`);
            expect(document.activeElement, `focus inside layer`).to.equal(layerInput);

            await keyboard.press(`Tab`);
            expect(document.activeElement, `focus after layer`).to.equal(bgAfterInput);
        });

        it(`should trap focus in blocking layer`, async () => {
            const { expectHTMLQuery } = testDriver.render(`
                <script>
                    import {Root, Layer} from '@zeejs/svelte';
                </script>
                <Root>
                    <input id="bgBeforeInput" />
                    <Layer backdrop="block">
                        <input id="layerFirstInput" />
                        <input id="layerLastInput" />
                    </Layer>
                    <input id="bgAfterInput" />
                </Root>
            `);
            const layerFirstInput = expectHTMLQuery(`#layerFirstInput`);
            const layerLastInput = expectHTMLQuery(`#layerLastInput`);

            layerLastInput.focus();
            expect(document.activeElement, `start focus in layer`).to.equal(layerLastInput);

            await keyboard.press(`Tab`);
            expect(document.activeElement, `ignore blocked parent`).to.equal(layerFirstInput);
        });

        it(`should re-focus last element of an un-blocked layer`, async () => {
            const { expectHTMLQuery, updateProps } = testDriver.render(`
                <script>
                    import {Root, Layer} from '@zeejs/svelte';
                    export let renderLayer = false;
                </script>
                <Root>
                    <input id="bgInput" />
                    {#if renderLayer}
                        <Layer backdrop="block">layer content</Layer>
                    {/if}
                </Root>
            `);
            const bgInput = expectHTMLQuery(`#bgInput`);
            bgInput.focus();

            await updateProps({ renderLayer: true });

            expect(document.activeElement, `blocked input blur`).to.equal(document.body);

            await updateProps({ renderLayer: false });

            expect(document.activeElement, `refocus input`).to.equal(bgInput);
        });
    });
});