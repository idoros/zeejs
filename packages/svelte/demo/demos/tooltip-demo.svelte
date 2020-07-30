<script>
    import { Tooltip } from '../../src';
    import Box from '../box.svelte';
</script>

<h2>Tooltip</h2>
<div
    style="
        display: flex;
        justify-content: space-evenly;
        flex-wrap: wrap;
    "
>
    <a href="#nolink">
        link<Tooltip>
            <Box shadow>
                <Box shadow style="padding: 0.5em;">
                    Tooltip from {`<a />`}
                </Box>
            </Box>
        </Tooltip>
    </a>
    <button>
        button<Tooltip>
            <Box shadow style="padding: 0.5em;">
                Tooltip from {`<button />`}
            </Box>
        </Tooltip>
    </button>
    <div tabIndex={0}>
        div with tip<Tooltip>
            <Box shadow style="padding: 0.5em; max-width: 20em;">
                Don't forget to set the tooltip anchor to be tabbable for keyboard
                navigation
            </Box>
        </Tooltip>
    </div>
    <button>
        interactive tooltip<Tooltip>
            <Box
                shadow
                style="padding: 0.5em; display: grid; justify-items: start;"
            >
                <input
                    value="click or focus into tooltip"
                />
                <a href="#nolink">
                    nested tooltip<Tooltip>
                        <Box shadow style="padding: 0.5em;">
                            Tooltip from{' '}
                            <a href="#nolink">
                                tooltip?<Tooltip>
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
