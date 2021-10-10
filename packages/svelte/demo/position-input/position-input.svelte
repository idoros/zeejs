<script>
    import { Position, keyArrowMap, symbolMap } from './position';
    export let value = Position.center;
    export let onChange;
    export let root;

    function onClick({ target }) {
        if (target instanceof HTMLButtonElement) {
            const clickedName = target.dataset.name;
            const PositionValue = Position[clickedName];
            if (PositionValue) {
                onChange(PositionValue);
            }
        }
    }
    function onKeyDown(event) {
        const { keyCode, currentTarget } = event;
        if (keyCode < 37 || keyCode > 40) {
            return;
        }
        event.preventDefault();
        const activeElement = document.activeElement;
        const value =
            activeElement instanceof HTMLButtonElement ? activeElement.dataset.name : currentValue;
        const nextValue = keyArrowMap[keyCode][value || currentValue];
        const nextFocus = currentTarget.querySelector(`[data-name="${nextValue}"]`);
        if (nextFocus instanceof HTMLElement) {
            nextFocus.focus();
        }
    }
</script>

<style>
    .PositionInput__root {
        display: inline-grid;
        grid-template-columns: repeat(3, auto);
    }
    .PositionInput__btn:focus {
        position: relative;
    }
    .PositionInput__btn--checked {
        background: gold;
    }
</style>

<div bind:this={root} class="PositionInput__root" on:click={onClick} on:keydown={onKeyDown}>
    {#each Object.values(Position) as itemValue}
        <button
            data-name={itemValue}
            class={[`PositionInput__btn`, itemValue === value ? `PositionInput__btn--checked` : ``].join(` `)}
            type="button">
            {symbolMap[itemValue]}
        </button>
    {/each}
</div>
