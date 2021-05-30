<script>
    import { getUniqueId } from '../unique-id';
    import { Position, keyArrowMap, symbolMap } from './position';
    import PositionInput from './position-input.svelte';
    import { Popover } from '@zeejs/svelte';
    import { tabbable } from 'tabbable';
    import { afterUpdate } from 'svelte';

    export let id = getUniqueId();
    export let value = Position.center;
    export let onChange;
    let isOpen = false;
    let isJustOpened = false;
    let popup;

    function onToggleClick(event) {
        if (event.target === event.currentTarget) {
            if(!isOpen) {
                isJustOpened = true;
            }
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

    // afterUpdate(() => {
    //     if(isJustOpened) {
    //         isJustOpened = false;
    //         debugger
    //         if(popup) {
    //             const result = tabbable(popup, { includeContainer: true });
    //             if (result.length) {
    //                 result[0].focus();
    //             }
    //         }
    //     }
    // });
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
        <Popover
            backdrop="block"
            positionX="center"
            positionY="center"
            onClickOutside={close}
        >
            <PositionInput bind:root={popup} {value} onChange={onSelect} />
        </Popover>
    {/if}
</button>
