<script>
    import { Tooltip } from '../../src';
    import { getUniqueId } from '../unique-id';
    import Box from '../box.svelte';

    const id = getUniqueId();

    let tooltipOptions = {
        // mouseDelay: 500,
        positionX: `center`,
        positionY: `before`,
        margin: 0,
    };

    function formChange(event) {
        const data = new FormData(event.currentTarget);
        tooltipOptions = {
            positionX: data.get(`positionX`),
            positionY: data.get(`positionY`),
            margin: Number(data.get(`margin`)),
        };
    }
</script>

<h2>Tooltip</h2>
<form
    on:change={formChange}
    on:keyup={formChange}
>
    <label for={id + `-positionX`}>position X</label>
    <select
        id={id + `-positionX`}
        name="positionX"
        value={tooltipOptions.positionX}
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
        name="positionY"
        value={tooltipOptions.positionY}
    >
        <option value="before" label="before" />
        <option value="start" label="start" />
        <option value="center" label="center" />
        <option value="end" label="end" />
        <option value="after" label="after" />
    </select>
    <label for={id + `-margin`}>margin</label>
    <input
        type="number"
        id={id + `-margin`}
        name="margin"
        value={tooltipOptions.margin}
    />
</form>
<div
    style="
        margin-top: 0.5em;
        display: flex;
        justify-content: space-evenly;
        flex-wrap: wrap;
    "
>
    <a href="#nolink">
        link<Tooltip
            positionX={tooltipOptions.positionX}
            positionY={tooltipOptions.positionY}
            margin={tooltipOptions.margin}
        >
            <Box shadow>
                <Box shadow style="padding: 0.5em;">
                    Tooltip from {`<a />`}
                </Box>
            </Box>
        </Tooltip>
    </a>
    <button>
        button<Tooltip
            positionX={tooltipOptions.positionX}
            positionY={tooltipOptions.positionY}
            margin={tooltipOptions.margin}
        >
            <Box shadow style="padding: 0.5em;">
                Tooltip from {`<button />`}
            </Box>
        </Tooltip>
    </button>
    <div tabIndex={0}>
        div with tip<Tooltip
            positionX={tooltipOptions.positionX}
            positionY={tooltipOptions.positionY}
            margin={tooltipOptions.margin}
        >
            <Box shadow style="padding: 0.5em; max-width: 20em;">
                Don't forget to set the tooltip anchor to be tabbable for keyboard
                navigation
            </Box>
        </Tooltip>
    </div>
    <button>
        interactive tooltip<Tooltip
            positionX={tooltipOptions.positionX}
            positionY={tooltipOptions.positionY}
            margin={tooltipOptions.margin}
        >
            <Box
                shadow
                style="padding: 0.5em; display: grid; justify-items: start;"
            >
                <input
                    value="click or focus into tooltip"
                />
                <a href="#nolink">
                    nested tooltip<Tooltip
                        positionX={tooltipOptions.positionX}
                        positionY={tooltipOptions.positionY}
                        margin={tooltipOptions.margin}
                    >
                        <Box shadow style="padding: 0.5em;">
                            Tooltip from{' '}
                            <a href="#nolink">
                                tooltip?<Tooltip
                                    positionX={tooltipOptions.positionX}
                                    positionY={tooltipOptions.positionY}
                                    margin={tooltipOptions.margin}
                                >
                                    <Box shadow style="padding: 0.5em;">
                                        ...from tooltip
                                    </Box>
                                </Tooltip>
                            </a>
                        </Box>
                    </Tooltip>
                </a>
            </Box>
        </Tooltip>
    </button>
</div>
