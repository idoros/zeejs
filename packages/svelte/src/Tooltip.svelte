<script>
    import Layer from './Layer.svelte';
    import { tooltip, isContainedBy, overlayPosition } from '@zeejs/browser';
    import { onMount, afterUpdate } from 'svelte';

    export let mouseDelay;
    export let positionX;
    export let positionY;

    let placeholderRef;
    let overlayRef;
    let isOpen = false;
    const tooltipLogic = tooltip({
        onToggle() {
            isOpen = !isOpen;
        },
        mouseDelay,
        isInOverlay: isContainedBy,
        positionX,
        positionY
    });

    onMount(() => {
        const anchor = placeholderRef.parentElement;
        if (!anchor) {
            return;
        }
        tooltipLogic.setAnchor(anchor);
        return () => tooltipLogic.stop();
    });
    afterUpdate(() => {
        tooltipLogic.setOverlay(overlayRef);
    });

    $: {
        tooltipLogic.updatePosition({
            x: positionX,
            y: positionY,
        });
    }
</script>

<span bind:this={placeholderRef}>
    {#if isOpen}
        <Layer
            onFocusChange={tooltipLogic.flagOverlayFocus}
            onMouseIntersection={tooltipLogic.flagMouseOverOverlay}
            onClickOutside={() => tooltipLogic.flagOverlayFocus(false)}
        >
            <div bind:this={overlayRef} class={tooltipLogic.initialOverlayCSSClass}>
                <slot />
            </div>
        </Layer>
    {/if}
</span>

