<script>
    import { Root } from '../src';
    import ModalDemo from './demos/modal-demo.svelte';
    import TooltipDemo from './demos/tooltip-demo.svelte';
</script>

<style>
    .demoBox {
        margin: 1em auto;
        max-width: 50vw;
        text-align: center;
        border: 2px solid #6d6d6d;
        border-radius: 10px;
        padding: 1em;
    }
    .demoBox > :global(form) {
        display: inline-grid;
        grid-template-columns: auto auto;
        text-align: left;
        grid-gap: 0.5em;
    }
    .demoBox > :global(form > button[type='submit']) {
        grid-column-start: 1;
        grid-column-end: 3;
    }
</style>

<div>
    <div class="demoBox">
        <ModalDemo>
            <svelte:self />
        </ModalDemo>
        <hr/>
        <TooltipDemo />
    </div>
</div>
