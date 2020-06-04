<script>
    import { setContext, getContext, onMount } from 'svelte';

    export let overlap = `window`;
    export let backdrop = `none`;

    let originRoot;
    let element;
    const parentLayer = getContext(`zeejs-context`);
    const layer = parentLayer.createLayer({
        settings: {
            overlap,
            backdrop
        }
    });

    onMount(() => {
        // ToDo: enable a way to delay layer creation to allow Layer component to supply the element
        const placeholder = layer.element;
        if (placeholder.parentElement) {
            placeholder.parentElement.replaceChild(element, placeholder);
        }
        for (const attrName of placeholder.getAttributeNames()) {
            element.setAttribute(attrName, placeholder.getAttribute(attrName));
        }
        layer.element = element;

        return () => {
            parentLayer.removeLayer(layer);
        };
    });
</script>

<zeejs-origin bind:this={originRoot} tabIndex={0} data-origin={layer.element.id}>
    <zeejs-layer bind:this={element}>
        <slot />
    </zeejs-layer>
</zeejs-origin>
