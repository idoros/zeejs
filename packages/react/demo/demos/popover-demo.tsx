import { getUniqueId } from '../unique-id';
import { Box } from '../box';
import { Popover, OverlayPosition } from '@zeejs/react';
import React from 'react';

export const PopoverDemo = ({ children }: { children: React.ReactNode }) => {
    const id = React.useMemo(() => getUniqueId(), []);
    const [popoverData, updateLayer] = React.useState({
        isOpen: false,
        avoidAnchor: false,
        positionX: `center` as OverlayPosition,
        positionY: `after` as OverlayPosition,
        matchWidth: false,
        matchHeight: false,
    });

    const formSubmit = React.useCallback(
        (event: React.FormEvent) => {
            event.preventDefault();
            updateLayer({
                ...popoverData,
                isOpen: true,
            });
        },
        [popoverData]
    );

    const closePopover = React.useCallback(() => {
        updateLayer({
            isOpen: false,
            avoidAnchor: popoverData.avoidAnchor,
            positionX: popoverData.positionX,
            positionY: popoverData.positionY,
            matchWidth: popoverData.matchWidth,
            matchHeight: popoverData.matchHeight,
        });
    }, [popoverData]);

    return (
        <>
            <h2>Popover</h2>

            <form onSubmit={formSubmit}>
                <label htmlFor={id + `-avoidAnchor`}>avoid anchor overlap</label>
                <input
                    type="checkbox"
                    id={id + `-avoidAnchor`}
                    checked={popoverData.avoidAnchor}
                    onChange={({ target }) =>
                        updateLayer((data) => ({ ...data, avoidAnchor: target.checked }))
                    }
                ></input>
                <label htmlFor={id + `-positionX`}>position X</label>
                <select
                    id={id + `-positionX`}
                    value={popoverData.positionX}
                    onChange={({ target }) =>
                        updateLayer((data) => ({
                            ...data,
                            positionX: target.value as OverlayPosition,
                        }))
                    }
                >
                    <option value="before" label="before" />
                    <option value="start" label="start" />
                    <option value="center" label="center" />
                    <option value="end" label="end" />
                    <option value="after" label="after" />
                </select>
                <label htmlFor={id + `-positionY`}>position Y</label>
                <select
                    id={id + `-positionY`}
                    value={popoverData.positionY}
                    onChange={({ target }) =>
                        updateLayer((data) => ({
                            ...data,
                            positionY: target.value as OverlayPosition,
                        }))
                    }
                >
                    <option value="before" label="before" />
                    <option value="start" label="start" />
                    <option value="center" label="center" />
                    <option value="end" label="end" />
                    <option value="after" label="after" />
                </select>
                <label>
                    match width
                    <input
                        type="checkbox"
                        checked={popoverData.matchWidth}
                        onChange={({ target }) =>
                            updateLayer((data) => ({ ...data, matchWidth: target.checked }))
                        }
                    ></input>
                </label>
                <label>
                    match height
                    <input
                        type="checkbox"
                        checked={popoverData.matchHeight}
                        onChange={({ target }) =>
                            updateLayer((data) => ({ ...data, matchHeight: target.checked }))
                        }
                    ></input>
                </label>
                <button type="submit" style={{ height: `9em`, width: `300px` }}>
                    {popoverData.isOpen ? `Popover is open` : `Open popover`}
                    <Popover
                        show={popoverData.isOpen}
                        avoidAnchor={popoverData.avoidAnchor}
                        positionX={popoverData.positionX}
                        positionY={popoverData.positionY}
                        matchWidth={popoverData.matchWidth}
                        matchHeight={popoverData.matchHeight}
                    >
                        <Box shadow className="PopoverDemo__popoverContainer">
                            <details className="PopoverDemo__shrinkable">
                                <summary>show demos</summary>
                                {children}
                            </details>
                            <button type="button" onClick={closePopover}>
                                close popover
                            </button>
                        </Box>
                    </Popover>
                </button>
            </form>
        </>
    );
};
