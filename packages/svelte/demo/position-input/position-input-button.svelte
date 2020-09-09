<script>
    import { getUniqueId } from '../unique-id';
    import { Position, keyArrowMap, symbolMap } from './position';
    import PositionInput from './position-input.svelte';
    import Dialog from '../layers/dialog.svelte';
    import { tabbable } from 'tabbable';

    export let id = getUniqueId();
    export let value = Position.center;
    export let onChange;
    let isOpen = false;
    let popup;

    function onToggleClick(event) {
        if (event.target === event.currentTarget) {
            isOpen = !isOpen;
        }
    }

    function close() {
        isOpen = false;
    }

    function onSelect(selectedValue) {
        isOpen = false;
        onChange(selectedValue);
    }
</script>

<style>
    .PositionInputButton__root {
        background: white;
        border: 1px solid rgb(118, 118, 118);
    }
</style>

<button
    {id}
    on:click={onToggleClick}
    class={[`PositionInputButton__root`, `resetButton`].join(` `)}
    type="button">
    {symbolMap[value]}
    {#if isOpen}
        <Dialog
            relativeTo={id}
            backdrop="block"
            onClickOutside={close}
            onPositioned={() => {
                if (popup) {
                    const result = tabbable(popup, { includeContainer: true });
                    if (result.length) {
                        result[0].focus();
                    }
                }
            }}>
            <PositionInput bind:root={popup} {value} onChange={onSelect} />
        </Dialog>
    {/if}
</button>
