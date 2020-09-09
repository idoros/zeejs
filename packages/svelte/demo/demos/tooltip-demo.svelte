<script>
    import { Tooltip, overlayPosition } from '../../src';
    import { getUniqueId } from '../unique-id';
    import Box from '../box.svelte';

    const id = getUniqueId();

    let tooltipOptions = {
        // mouseDelay: 500,
        positionX: overlayPosition.center,
        positionY: overlayPosition.before,
    };

    function formChange(event) {
        const data = new FormData(event.currentTarget);
        tooltipOptions = {
            positionX: data.get(`positionX`),
            positionY: data.get(`positionY`),
        };
    }
</script>

<h2>Tooltip</h2>
<form
    on:change={formChange}
>
    <label for={id + `-positionX`}>position X</label>
    <select
        id={id + `-positionX`}
        name="positionX"
        value={tooltipOptions.positionX}
    >
        <option value={overlayPosition.before} label="before" />
        <option value={overlayPosition.start} label="start" />
        <option value={overlayPosition.center} label="center" />
        <option value={overlayPosition.end} label="end" />
        <option value={overlayPosition.after} label="after" />
    </select>
    <label for={id + `-positionY`}>position Y</label>
    <select
        id={id + `-positionY`}
        name="positionY"
        value={tooltipOptions.positionY}
    >
        <option value={overlayPosition.before} label="before" />
        <option value={overlayPosition.start} label="start" />
        <option value={overlayPosition.center} label="center" />
        <option value={overlayPosition.end} label="end" />
        <option value={overlayPosition.after} label="after" />
    </select>
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
                    >
                        <Box shadow style="padding: 0.5em;">
                            Tooltip from{' '}
                            <a href="#nolink">
                                tooltip?<Tooltip
                                    positionX={tooltipOptions.positionX}
                                    positionY={tooltipOptions.positionY}
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
