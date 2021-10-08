<script>
    import Layer from './Layer.svelte';
    import { popover, overlayPosition } from '@zeejs/browser';
    import { onMount } from 'svelte';

    export let show = true;
    export let positionX = 'center';
    export let positionY = 'after';
    export let avoidAnchor = false;
    export let matchWidth = false;
    export let matchHeight = false;
    export let backdrop = `none`;

    const { open, close, updateOptions, isOpen } = popover();

    // close on unmount
    onMount(() => () => close());

    let placeholderRef;
    let overlayRef;

    $: {
        const anchor = placeholderRef ? placeholderRef.parentElement : null;
        const overlay = overlayRef;
        const opened = isOpen();
        if (opened && !show) {
            close();
        }
        if (show && anchor && overlay) {
            const options = {
                positionX,
                positionY,
                avoidAnchor,
                matchWidth,
                matchHeight,
            };
            opened
                ? updateOptions(options)
                : open(
                      {
                          anchor,
                          overlay,
                      },
                      options
                  );
        }
    }
</script>

<span bind:this={placeholderRef}>
    {#if show}
        <Layer
            overlap="window"
            backdrop={backdrop}
        >
            <div bind:this={overlayRef}>
                <slot />
            </div>
        </Layer>
    {/if}
</span>

