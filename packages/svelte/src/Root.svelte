<script>
    import {
        createRoot,
        updateLayers,
        watchFocus,
        watchClickOutside,
        watchMouseInside,
        watchEscape,
        createBackdropParts
    } from '@zeejs/browser';
    import { setContext, onMount } from 'svelte';

    let wrapper;
    let rootLayerElement;
    const backdrop = createBackdropParts();
    const onChange = (reason, layer) => {
        if (!wrapper) {
            return;
        }
        rootLayer.element = rootLayerElement;
        const forceFocus = reason === `remove` && layer.state.focusInside;
        updateLayers(wrapper, rootLayer, backdrop, { asyncFocusChange: true, forceFocus });
    };
    const rootLayer = createRoot({ onChange });

    setContext(`zeejs-context`, rootLayer);

    onMount(() => {
        const { stop: stopFocus } = watchFocus(wrapper, rootLayer);
        const { stop: stopClickOutside } = watchClickOutside(rootLayer, backdrop);
        const { stop: stopMouseInside } = watchMouseInside(wrapper, rootLayer, backdrop);
        const { stop: stopEscape } = watchEscape(rootLayer);
        onChange();
        return () => {
            stopFocus();
            stopClickOutside();
            stopMouseInside();
            stopEscape();
        };
    });
</script>

<style>
    /*ToDo: move to @zeejs/browser */
    :global(zeejs-block) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    :global(zeejs-hide) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(66, 66, 66, 0.5);
    }
    :global(zeejs-origin) {
        overflow: hidden;
        display: inline-block;
        width: 0;
        height: 0;
    }
    :global(zeejs-layer) {
        pointer-events: none;
    }
    :global(zeejs-layer) > :global(*) {
        pointer-events: initial;
    }
    :global(.zeejs--overlapWindow) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    :global(.zeejs--notPlaced), :global(.zeejs--notPlaced) * {
        visibility: hidden!important;
    }
</style>

<div bind:this={wrapper}>
    <zeejs-layer bind:this={rootLayerElement}>
        <slot />
    </zeejs-layer>
    <!-- layers injected here -->
</div>
