<script>
    import Layer from './Layer.svelte';
    import { popover, overlayPosition } from '@zeejs/browser';
    import { onMount } from 'svelte';

    let className
    export { className as class };
    export let style;
    export let positionX = 'center';
    export let positionY = 'after';
    export let matchWidth = false;
    export let matchHeight = false;
    export let backdrop = `none`;
    export let show = true;
    export let avoidAnchor = false;
    export let onClickOutside;
    export let onFocusChange;
    export let onMouseIntersection;

    const { open, close, updateOptions, isOpen, overlayCSSClass } = popover();

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
                matchWidth,
                matchHeight,
                avoidAnchor,
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
            onClickOutside={onClickOutside}
            onFocusChange={onFocusChange}
            onMouseIntersection={onMouseIntersection}
        >
            <div bind:this={overlayRef} class={overlayCSSClass(className)} style={style}>
                <slot />
            </div>
        </Layer>
    {/if}
</span>

