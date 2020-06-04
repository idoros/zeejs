<script>
    import { createRoot, updateLayers, watchFocus, createBackdropParts } from '@zeejs/browser';
    import { setContext, onMount } from 'svelte';

    let wrapper;
    const backdrop = createBackdropParts();
    const rootLayer = createRoot({
        onChange() {
            if (!wrapper) {
                return;
            }
            updateLayers(wrapper, rootLayer, backdrop);
        }
    });

    setContext(`zeejs-context`, rootLayer);

    onMount(() => {
        rootLayer.element = wrapper.firstElementChild;
        const { stop: stopFocus } = watchFocus(wrapper);
        updateLayers(wrapper, rootLayer, backdrop);
        return () => {
            stopFocus();
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
    <zeejs-layer>
        <slot />
    </zeejs-layer>
    <!-- layers injected here -->
</div>
