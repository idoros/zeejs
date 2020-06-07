<script>
    import {
        createRoot,
        updateLayers,
        watchFocus,
        watchClickOutside,
        createBackdropParts
    } from '@zeejs/browser';
    import { setContext, onMount } from 'svelte';

    let wrapper;
    let rootLayerElement;
    const backdrop = createBackdropParts();
    const onChange = () => {
        if (!wrapper) {
            return;
        }
        rootLayer.element = rootLayerElement;
        updateLayers(wrapper, rootLayer, backdrop);
    };
    const rootLayer = createRoot({ onChange });

    setContext(`zeejs-context`, rootLayer);

    onMount(() => {
        const { stop: stopFocus } = watchFocus(wrapper);
        const { stop: stopClickOutside } = watchClickOutside(wrapper, rootLayer, backdrop);
        onChange();
        return () => {
            stopFocus();
            stopClickOutside();
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
</style>

<div bind:this={wrapper}>
    <zeejs-layer bind:this={rootLayerElement}>
        <slot />
    </zeejs-layer>
    <!-- layers injected here -->
</div>
