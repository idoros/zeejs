import { getUniqueId } from '../unique-id';
import { Box } from '../box';
import { Tooltip, overlayPosition } from '@zeejs/react';
import React from 'react';

export const TooltipDemo = () => {
    const id = React.useMemo(() => getUniqueId(), []);
    const [tooltipOptions, updateOptions] = React.useState({
        // mouseDelay: 500,
        positionX: overlayPosition.center,
        positionY: overlayPosition.before,
    });

    return (
        <>
            <h2 title="native title">Tooltip</h2>
            <form>
                <label htmlFor={id + `-positionX`}>position X</label>
                <select
                    id={id + `-positionX`}
                    value={tooltipOptions.positionX}
                    onChange={({ target }) =>
                        updateOptions((data) => ({
                            ...data,
                            positionX: target.value as overlayPosition,
                        }))
                    }
                >
                    <option value={overlayPosition.before} label="before" />
                    <option value={overlayPosition.start} label="start" />
                    <option value={overlayPosition.center} label="center" />
                    <option value={overlayPosition.end} label="end" />
                    <option value={overlayPosition.after} label="after" />
                </select>
                <label htmlFor={id + `-positionY`}>position Y</label>
                <select
                    id={id + `-positionY`}
                    value={tooltipOptions.positionY}
                    onChange={({ target }) =>
                        updateOptions((data) => ({
                            ...data,
                            positionY: target.value as overlayPosition,
                        }))
                    }
                >
                    <option value={overlayPosition.before} label="before" />
                    <option value={overlayPosition.start} label="start" />
                    <option value={overlayPosition.center} label="center" />
                    <option value={overlayPosition.end} label="end" />
                    <option value={overlayPosition.after} label="after" />
                </select>
            </form>
            <div
                style={{
                    marginTop: `0.5em`,
                    display: `flex`,
                    justifyContent: `space-evenly`,
                    flexWrap: `wrap`,
                }}
            >
                <a href="#">
                    link
                    <Tooltip
                        positionX={tooltipOptions.positionX}
                        positionY={tooltipOptions.positionY}
                    >
                        <Box shadow style={{ padding: `0.5em` }}>
                            Tooltip from {`<a />`}
                        </Box>
                    </Tooltip>
                </a>
                <button>
                    button
                    <Tooltip
                        positionX={tooltipOptions.positionX}
                        positionY={tooltipOptions.positionY}
                    >
                        <Box shadow style={{ padding: `0.5em` }}>
                            Tooltip from {`<button />`}
                        </Box>
                    </Tooltip>
                </button>
                <div tabIndex={0}>
                    div with tip
                    <Tooltip
                        positionX={tooltipOptions.positionX}
                        positionY={tooltipOptions.positionY}
                    >
                        <Box shadow style={{ maxWidth: `20em`, padding: `0.5em` }}>
                            Don't forget to set the tooltip anchor to be tabbable for keyboard
                            navigation
                        </Box>
                    </Tooltip>
                </div>
                <button>
                    interactive tooltip
                    <Tooltip
                        positionX={tooltipOptions.positionX}
                        positionY={tooltipOptions.positionY}
                    >
                        <Box
                            shadow
                            style={{ padding: `0.5em`, display: `grid`, justifyItems: `start` }}
                        >
                            <input value="click or focus into tooltip" onChange={noop} />
                            <a href="#">
                                nested tooltip
                                <Tooltip
                                    positionX={tooltipOptions.positionX}
                                    positionY={tooltipOptions.positionY}
                                >
                                    <Box shadow style={{ padding: `0.5em` }}>
                                        Tooltip from{' '}
                                        <a href="#">
                                            tooltip?
                                            <Tooltip
                                                positionX={tooltipOptions.positionX}
                                                positionY={tooltipOptions.positionY}
                                            >
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
const noop = () => {
    /**/
};
