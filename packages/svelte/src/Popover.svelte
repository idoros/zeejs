<script>
    import Layer from './Layer.svelte';
    import { popover, overlayPosition } from '@zeejs/browser';
    import { onMount } from 'svelte';

    let className
    export { className as class };
    export let style;
    export let show = true;
    export let positionX = 'center';
    export let positionY = 'after';
    export let avoidAnchor = false;
    export let matchWidth = false;
    export let matchHeight = false;
    export let backdrop = `none`;
    export let onDisplayChange = ()=>{};
    export let onClickOutside;
    export let onFocusChange;
    export let onMouseIntersection;
    export let onEscape;

    const { open, close, updateOptions, isOpen } = popover();

    // close on unmount
    onMount(() => () => {
        if (isOpen()) {
            close();
            onDisplayChange(false);
        }
    });

    let placeholderRef;
    let overlayRef;

    $: {
        const anchor = placeholderRef ? placeholderRef.parentElement : null;
        const overlay = overlayRef;
        const opened = isOpen();
        if (opened && !show) {
            close();
            onDisplayChange(false);
        }
        if (show && anchor && overlay) {
            const options = {
                positionX,
                positionY,
                avoidAnchor,
                matchWidth,
                matchHeight,
            };
            if (opened) {
                updateOptions(options);
            } else {
                open(
                    {
                        anchor,
                        overlay,
                    },
                    options
                );
                onDisplayChange(true);
            }
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
            onEscape={onEscape}
        >
            <div 
                bind:this={overlayRef}
                class={className}
                style={style}>
                <slot />
            </div>
        </Layer>
    {/if}
</span>

