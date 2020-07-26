<script>
    import { setContext, getContext, onMount } from 'svelte';

    export let overlap = `window`;
    export let backdrop = `none`;
    export let onClickOutside;
    export let onFocusChange;
    export let onMouseIntersection;

    let originRoot;
    let element;
    const parentLayer = getContext(`zeejs-context`);
    const layer = parentLayer.createLayer({
        settings: {
            overlap,
            backdrop,
            onClickOutside,
            generateElement: false,
            onMouseIntersection: () => {
                if (onMouseIntersection) {
                    onMouseIntersection(layer.state.mouseInside);
                }
            },
            onFocusChange: () => {
                if (onFocusChange) {
                    onFocusChange(layer.state.focusInside);
                }
            },
        }
    });

    setContext(`zeejs-context`, layer);

    onMount(() => {
        layer.setElement(element);
        return () => {
            parentLayer.removeLayer(layer);
        };
    });
</script>

<zeejs-origin bind:this={originRoot} tabIndex={0} data-origin={layer.id}>
    <zeejs-layer bind:this={element}>
        <slot />
    </zeejs-layer>
</zeejs-origin>
