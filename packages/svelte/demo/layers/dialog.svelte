<script>
    import { Layer } from '../../src';
    import { onMount } from 'svelte';
    import { createPopper } from '@popperjs/core';

    export let relativeTo;
    export let onClickOutside;
    export let onPositioned;
    export let backdrop = `none`;

    let popup;
    let isPositioned = false;
    let className = [`Dialog__root`, isPositioned ? `Dialog--positioned` : ``].join(` `);

    onMount(() => {
        const reference =
            typeof relativeTo === `string` ? document.querySelector(`#` + relativeTo) : relativeTo;
        if (!reference) {
            throw new Error(`missing reference for popup: "${String(relativeTo)}"`);
        }
        const popper = createPopper(reference, popup, {});
        isPositioned = true;
        popup.classList.add(`Dialog--positioned`);
        onPositioned && onPositioned();
        return () => {
            popper.destroy();
        };
    });
</script>

<style>
    .Dialog__root:not(.Dialog--positioned),
    .Dialog__root:not(.Dialog--positioned) * {
        visibility: hidden !important;
    }
</style>

<Layer {backdrop} {onClickOutside}>
    <div bind:this={popup} class={className}>
        <slot />
    </div>
</Layer>
