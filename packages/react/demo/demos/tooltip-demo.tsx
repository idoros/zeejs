// import { getUniqueId } from '../unique-id';
import { Box } from '../box';
import { Tooltip } from '@zeejs/react';
import React from 'react';

export const TooltipDemo = () => {
    // const id = React.useMemo(() => getUniqueId(), []);
    // const [tooltipOptions, updateOptions] = React.useState({
    //     mouseDelay: 500,
    // });

    return (
        <>
            <h2 title="native title">Tooltip</h2>
            {/* <form>
                <label htmlFor={id + `-mouseDelay`}>mouse delay (ms)</label>
                <input
                    id={id + `-mouseDelay`}
                    type="number"
                    value={tooltipOptions.mouseDelay}
                    onChange={({ target }) =>
                        updateOptions((data) => ({ ...data, mouseDelay: Number(target.value) }))
                    }
                ></input>
            </form> */}
            <div
                style={{
                    // marginTop: `1em`,
                    display: `flex`,
                    justifyContent: `space-evenly`,
                    flexWrap: `wrap`,
                }}
            >
                <a href="#">
                    link
                    <Tooltip>
                        <Box shadow>
                            <Box shadow style={{ padding: `0.5em` }}>
                                Tooltip from {`<a />`}
                            </Box>
                        </Box>
                    </Tooltip>
                </a>
                <button>
                    button
                    <Tooltip>
                        <Box shadow style={{ padding: `0.5em` }}>
                            Tooltip from {`<button />`}
                        </Box>
                    </Tooltip>
                </button>
                <div tabIndex={0}>
                    div with tip
                    <Tooltip>
                        <Box shadow style={{ maxWidth: `20em`, padding: `0.5em` }}>
                            Don't forget to set the tooltip anchor to be tabbable for keyboard
                            navigation
                        </Box>
                    </Tooltip>
                </div>
                <button>
                    interactive tooltip
                    <Tooltip>
                        <Box
                            shadow
                            style={{ padding: `0.5em`, display: `grid`, justifyItems: `start` }}
                        >
                            <input
                                value="click or focus into tooltip"
                                onChange={() => {
                                    /**/
                                }}
                            />
                            <a href="#">
                                nested tooltip
                                <Tooltip>
                                    <Box shadow style={{ padding: `0.5em` }}>
                                        Tooltip from{' '}
                                        <a href="#">
                                            tooltip?
                                            <Tooltip>
                                                <Box shadow style={{ padding: `0.5em` }}>
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
        </>
    );
};
