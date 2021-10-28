<script>
    import Layer from './Layer.svelte';
    import { modalAbsolutePositionAsString } from '@zeejs/browser';
    import { onMount, afterUpdate } from 'svelte';

    let className
    export { className as class }
    export let style;
    export let backdrop = `block`;
    export let position = `center`;
    export let show = true;
    export let onClickOutside;
    export let onFocusChange;
    export let onMouseIntersection;
    export let onEscape;

    let wrapperStyle;
    $: {
        const alignStyle = modalAbsolutePositionAsString(position);
        wrapperStyle = style ? style + alignStyle : alignStyle;
    }
</script>

{#if show}
    <Layer
        overlap="window"
        backdrop={backdrop}
        onClickOutside={onClickOutside}
        onFocusChange={onFocusChange}
        onMouseIntersection={onMouseIntersection}
        onEscape={onEscape}
    >
        <div class={className} style={wrapperStyle}>
            <slot />
        </div>
    </Layer>
{/if}

