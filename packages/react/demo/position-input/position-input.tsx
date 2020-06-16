import { getUniqueId } from '../unique-id';
import { Dialog } from '../layers/dialog';
import React from 'react';
import tabbable from 'tabbable';

export enum Position {
    topLeft = `topLeft`,
    top = `top`,
    topRight = `topRight`,
    left = `left`,
    center = `center`,
    right = `right`,
    bottomLeft = `bottomLeft`,
    bottom = `bottom`,
    bottomRight = `bottomRight`,
}

interface PositionProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    value: Position;
    onChange: (changed: Position) => void;
}

export const PositionInputButton = ({
    id: idProp,
    className,
    style,
    value,
    onChange,
}: PositionProps) => {
    const id = React.useMemo(() => idProp || getUniqueId(), [idProp]);
    const popupRef = React.useRef<HTMLDivElement>(null);
    const [isOpen, setOpen] = React.useState(false);
    const onToggleClick = React.useCallback(
        (event) => {
            if (event.target === event.currentTarget) {
                setOpen(!isOpen);
            }
        },
        [isOpen]
    );
    const onSelect = React.useCallback((selectedValue: Position) => {
        setOpen(false);
        onChange(selectedValue);
    }, []);

    return (
        <button
            id={id}
            onClick={onToggleClick}
            className={[`PositionInputButton__root`, `resetButton`, className].join(` `)}
            style={style}
            type="button"
        >
            {symbolMap[value]}
            {isOpen ? (
                <Dialog
                    relativeTo={id}
                    backdrop="block"
                    onClickOutside={() => setOpen(false)}
                    onPositioned={() => {
                        if (popupRef.current) {
                            const result = tabbable(popupRef.current, { includeContainer: true });
                            if (result.length) {
                                result[0].focus();
                            }
                        }
                    }}
                >
                    <PositionInput ref={popupRef} value={value} onChange={onSelect} />
                </Dialog>
            ) : null}
        </button>
    );
};

export const PositionInput = React.forwardRef<HTMLDivElement, PositionProps>(
    ({ id, className, style, value: currentValue, onChange }, rootRef) => {
        const onClick = React.useCallback(
            ({ target }: React.MouseEvent) => {
                if (target instanceof HTMLButtonElement) {
                    const clickedName = target.dataset.name! as Position;
                    const PositionValue = Position[clickedName];
                    if (PositionValue) {
                        onChange(PositionValue);
                    }
                }
            },
            [onChange]
        );
        const onKeyDown = React.useCallback(
            (event: React.KeyboardEvent) => {
                const { keyCode, currentTarget } = event;
                if (keyCode < 37 || keyCode > 40) {
                    return;
                }
                event.preventDefault();
                const activeElement = document.activeElement;
                const value =
                    activeElement instanceof HTMLButtonElement
                        ? (activeElement.dataset.name as Position)
                        : currentValue;
                const nextValue = keyArrowMap[keyCode][value || currentValue];
                const nextFocus = currentTarget.querySelector(`[data-name="${nextValue}"]`);
                if (nextFocus instanceof HTMLElement) {
                    nextFocus.focus();
                }
            },
            [currentValue]
        );

        return (
            <div
                id={id}
                ref={rootRef}
                className={[`PositionInput__root`, className].join(` `)}
                style={style}
                onClick={onClick}
                onKeyDown={onKeyDown}
            >
                {Object.values(Position).map((value) => {
                    const isSelected = currentValue === value;
                    return (
                        <button
                            key={value}
                            data-name={value}
                            className={[
                                `PositionInput__btn`,
                                isSelected ? `PositionInput__btn--checked` : ``,
                            ].join(` `)}
                            type="button"
                        >
                            {symbolMap[value]}
                        </button>
                    );
                })}
            </div>
        );
    }
);

export const getAbsolutePosition = (position: Position) => {
    const alignStyle: React.CSSProperties = { position: `absolute` };
    if (position === Position.center) {
        alignStyle.top = `50%`;
        alignStyle.left = `50%`;
        alignStyle.transform = `translate(-50%, -50%)`;
        return alignStyle;
    }
    switch (
        position // y
    ) {
        case Position.right:
        case Position.left:
            alignStyle.top = `50%`;
            alignStyle.transform = `translateY(-50%)`;
            break;
        case Position.top:
        case Position.topRight:
        case Position.topLeft:
            alignStyle.top = 0;
            break;
        case Position.bottom:
        case Position.bottomRight:
        case Position.bottomLeft:
            alignStyle.bottom = 0;
    }
    switch (
        position // x
    ) {
        case Position.top:
        case Position.bottom:
            alignStyle.left = `50%`;
            alignStyle.transform = `translateX(-50%)`;
            break;
        case Position.right:
        case Position.topRight:
        case Position.bottomRight:
            alignStyle.right = 0;
            break;
        case Position.left:
        case Position.topLeft:
        case Position.bottomLeft:
            alignStyle.left = 0;
    }
    return alignStyle;
};

const symbolMap = {
    [Position.topLeft]: `↖`,
    [Position.top]: `↑`,
    [Position.topRight]: `↗`,
    [Position.left]: `←`,
    [Position.center]: `•`,
    [Position.right]: `→`,
    [Position.bottomLeft]: `↙`,
    [Position.bottom]: `↓`,
    [Position.bottomRight]: `↘`,
};
const rightOf: Record<Position, Position> = {
    [Position.topLeft]: Position.top,
    [Position.top]: Position.topRight,
    [Position.topRight]: Position.left,
    [Position.left]: Position.center,
    [Position.center]: Position.right,
    [Position.right]: Position.bottomLeft,
    [Position.bottomLeft]: Position.bottom,
    [Position.bottom]: Position.bottomRight,
    [Position.bottomRight]: Position.topLeft,
};
const underOf: Record<Position, Position> = {
    [Position.topLeft]: Position.left,
    [Position.top]: Position.center,
    [Position.topRight]: Position.right,
    [Position.left]: Position.bottomLeft,
    [Position.center]: Position.bottom,
    [Position.right]: Position.bottomRight,
    [Position.bottomLeft]: Position.topLeft,
    [Position.bottom]: Position.top,
    [Position.bottomRight]: Position.topRight,
};
const leftOf: Record<Position, Position> = {} as any;
for (const [key, value] of Object.entries(rightOf)) {
    leftOf[(value as unknown) as Position] = key as Position;
}
const aboveOf: Record<Position, Position> = {} as any;
for (const [key, value] of Object.entries(underOf)) {
    aboveOf[(value as unknown) as Position] = key as Position;
}
const keyArrowMap: Record<number, Record<Position, Position>> = {
    37: leftOf,
    38: aboveOf,
    39: rightOf,
    40: underOf,
};
