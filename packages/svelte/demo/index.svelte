<script>
    import { Root } from '../src';
    import Box from './box';
    import Demos from './demos';
</script>

<style>
    :global(body) {
        margin: 0;
        --shadow: 3px 3px 7px 2px #404040;
    }
    :global(header) {
        position: sticky;
        top: 0;
        text-align: center;
        background: rgba(255, 255, 255, 0.8);
    }
    :global(.resetButton) {
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
    :global(.resetButton[disabled]) {
        cursor: default;
    }
    :global(:focus) {
        outline: 5px solid gold;
    }
    .backgroundText {
        color: grey;
        user-select: none;
    }
</style>

<Root>
    <header>
        <h1>zeejs Svelte demo</h1>
    </header>
    <Box style="padding: 1em">
        <Demos />
        <span aria-hidden="true" class="backgroundText">
            {Array.from({ length: 3000 }, () => `main layer`).join(` `)}
        </span>
    </Box>
</Root>
