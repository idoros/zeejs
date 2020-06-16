<script>
    const background = `hsl(${[Math.round(Math.random() * 360), '40%', '80%'].join(',')})`;

    export let className = ``;
    export let shadow = false;
    export let style = ``;
</script>

<style>
    .Box__root[data-shadow='true'] {
        box-shadow: var(--shadow, 3px 3px 7px 2px #404040);
    }
</style>

<div data-shadow={shadow} class="Box__root {className}" style="background: {background}; {style}">
    <slot />
</div>
