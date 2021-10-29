import { getUniqueId } from '../unique-id';
import { Popover } from '@zeejs/react';
import type { ModalPosition } from '@zeejs/react';
import React from 'react';
import { tabbable } from 'tabbable';

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
    value: ModalPosition;
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

    const onDisplayChange = React.useCallback((isDisplayed: boolean) => {
        if (isDisplayed && popupRef.current) {
            const result = tabbable(popupRef.current, {
                includeContainer: true,
            }) as HTMLElement[];
            if (result.length) {
                result[0].focus();
            }
        }
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
                <Popover
                    backdrop="block"
                    positionX="center"
                    positionY="center"
                    onClickOutside={() => setOpen(false)}
                    onDisplayChange={onDisplayChange}
                    onEscape={(event) => {
                        event.stopPropagation();
                        setOpen(false);
                    }}
                >
                    <PositionInput ref={popupRef} value={value} onChange={onSelect} />
                </Popover>
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
    leftOf[value as unknown as Position] = key as Position;
}
const aboveOf: Record<Position, Position> = {} as any;
for (const [key, value] of Object.entries(underOf)) {
    aboveOf[value as unknown as Position] = key as Position;
}
const keyArrowMap: Record<number, Record<Position, Position>> = {
    37: leftOf,
    38: aboveOf,
    39: rightOf,
    40: underOf,
};
