<script>
    import { getUniqueId } from '../unique-id';
    import Box from '../box.svelte';
    import { Popover } from '../../src';

    const id = getUniqueId();

    let popoverData = {
        isOpen: false,
        avoidAnchor: false,
        positionX: `center`,
        positionY: `after`,
        margin: 0,
        matchWidth: false,
        matchHeight: false,
        backdrop: `none`,
    };

    function formSubmit(event) {
        event.preventDefault();
        popoverData = {
            ...popoverData,
            isOpen: true
        };
    }

    function closePopover() {
        popoverData = {
            ...popoverData,
            isOpen: false,
        };
    }

    function onMarginChange({target}) {
        popoverData = { 
            ...popoverData,
            margin: Number(target.value)
        }
    }
</script>

<style>
    :global(.PopoverDemo__popoverContainer) {
        display: grid;
        height: 100%;
        max-height: 50vh;
        grid-template-rows: 1fr auto;
    }
    .PopoverDemo__shrinkable {
        overflow: auto;
    }
</style>

<h2>Popover</h2>

<form on:submit={formSubmit}>
    <label for={id + `-avoidAnchor`}>avoid anchor overlap</label>
    <input
        type="checkbox"
        id={id + `-avoidAnchor`}
        checked={popoverData.avoidAnchor}
        on:change={({ target }) =>
            popoverData = { ...popoverData, avoidAnchor: target.checked }
        }
    />
    <label for={id + `-positionX`}>position X</label>
    <select
        id={id + `-positionX`}
        value={popoverData.positionX}
        on:change={({ target }) =>
            popoverData = {
                ...popoverData,
                positionX: target.value
            }
        }
    >
        <option value="before" label="before" />
        <option value="start" label="start" />
        <option value="center" label="center" />
        <option value="end" label="end" />
        <option value="after" label="after" />
    </select>
    <label for={id + `-positionY`}>position Y</label>
    <select
        id={id + `-positionY`}
        value={popoverData.positionY}
        on:change={({ target }) =>
            popoverData = {
                ...popoverData,
                positionY: target.value
            }
        }
    >
        <option value="before" label="before" />
        <option value="start" label="start" />
        <option value="center" label="center" />
        <option value="end" label="end" />
        <option value="after" label="after" />
    </select>
    <label for={id + `-margin`}>margin</label>
    <input
        id={id + `-margin`}
        type="number"
        value={popoverData.margin}
        on:change={onMarginChange}
        on:keyup={onMarginChange}
    />
    <label>
        match width
        <input
            type="checkbox"
            checked={popoverData.matchWidth}
            on:change={({ target }) =>
                popoverData = { ...popoverData, matchWidth: target.checked }
            }
        />
    </label>
    <label>
        match height
        <input
            type="checkbox"
            checked={popoverData.matchHeight}
            on:change={({ target }) =>
                popoverData = { ...popoverData, matchHeight: target.checked }
            }
        />
    </label>
    <label for={id + `-backdrop`}>backdrop</label>
    <select
        id={id + `-backdrop`}
        value={popoverData.backdrop}
        on:blur={({ target }) =>
            popoverData = {
                ...popoverData,
                backdrop: target.value,
            }
        }
    >
        {#each [`none`, `block`, `hide`]  as backdrop}
            <option key={backdrop} value={backdrop}>
                {backdrop}
            </option>
        {/each}
    </select>
    <button type="submit" style="height: 9em; width: 300px">
        {popoverData.isOpen ? `Popover is open` : `Open popover`}
        <Popover
            show={popoverData.isOpen}
            avoidAnchor={popoverData.avoidAnchor}
            positionX={popoverData.positionX}
            positionY={popoverData.positionY}
            margin={popoverData.margin}
            matchWidth={popoverData.matchWidth}
            matchHeight={popoverData.matchHeight}
            backdrop={popoverData.backdrop}
        >
            <Box shadow className="PopoverDemo__popoverContainer">
                <details class="PopoverDemo__shrinkable">
                    <summary>show demos</summary>
                    <slot />
                </details>
                <button type="button" on:click={closePopover}>
                    close popover
                </button>
            </Box>
        </Popover>
    </button>
</form>