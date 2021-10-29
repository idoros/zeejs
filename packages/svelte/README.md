<p align="center">

![zeejs](https://raw.githubusercontent.com/idoros/zeejs/master/packages/site/media/logo.svg)

**zeejs Svelte** - simple API to create multi layered UI

![test status](https://github.com/idoros/zeejs/workflows/test/badge.svg)
[![npm version](https://badgen.net/npm/v/@zeejs/svelte?label=@zeejs/svelte&cache=300)](https://www.npmjs.com/package/@zeejs/svelte)
[![npm bundle size](https://badgen.net/bundlephobia/minzip/@zeejs/svelte?label=minzip&cache=300)](https://bundlephobia.com/result?p=@zeejs/svelte)

</p>

## what's in the box

-   **layers** - automatic ordering of nested layers
-   **backdrop** - hide / block background **or** keep a layer as part of the flow
-   **focus**
    -   <kbd>Tab</kbd> between layers
    -   trap focus above backdrop
    -   re-focus when blocking layer close
    -   focusChange notification when focus outside / inside logical layer
-   **click outside** - notification for click outside of logical layer
-   **mouse interaction** - notification for mouse enter / leave of logical layer
-   **escape catching** - notification for escape press
-   **server rendering** - single pass nested rendering of layers in the server
-   **component primitives** - Tooltip, Popover, Modal
-   **typed** - built with [TypeScript](https://www.typescriptlang.org/)
-   **tested** - tested in a browser

## how to use

This document describes the zeejs Svelte usage, For a more in depth overview of `zeejs`, please see the general [documentation](https://github.com/idoros/zeejs/blob/master/docs/documentation.md).

### `<Root>` component

At the base of the application or website place the `<Root>` component. The Root component is responsible for collecting, rendering and managing the layers.

> Notice that Root is required for **zeejs** to work properly.

**code example:**

```html
<script>
    import { Root } from '@zeejs/svelte';
</script>

<Root>
    <!-- application code -->
</Root>
```

will output:

```html
<div>
    <zeejs-layer>
        <!-- application code -->
    </zeejs-layer>
</div>
```

### `<Layer>` component

At every point that requires a part of the DOM to be moved up the normal layout flow and out of any overflows, a `<Layer>` component can be placed. The Layer is the low level primitive of **zeejs** that takes any given content and renders it in its own layer.

The component will generate a new zeejs layer above layer it is rendered in.

**props:**

| name                  | type                           | default  | required | description                                                                                                                                 |
| --------------------- | ------------------------------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `backdrop`            | "none" \| "block" \| "hide"    | "none"   | false    | background behavior; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#backdrop)                                 |
| `overlap`             | "window" \| HTMLElement        | "window" | false    | layer bounds reference                                                                                                                      |
| `onClickOutside`      | (target: EventTarget) => void  |          | false    | invoked on click outside; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#click-outside)                       |
| `onMouseIntersection` | (isInside: boolean) => void    |          | false    | invoked when mouse leaves or enters layer; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#mouse-intersection) |
| `onFocusChange`       | (isFocused: boolean) => void   |          | false    | invoked when focus is moved into/out of layer; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#focus-change)   |
| `onEscape`            | (event: KeyboardEvent) => void |          | false    | invoked when escape is pressed; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#escape)                        |

**code example:**

```html
<script>
    import { Layer } from '@zeejs/svelte';
</script>

<div>
    <Layer><!-- layer content --></Layer>
</div>
```

will output (assuming render in the application layer):

```html
<div>
    <zeejs-layer>
        <!-- application code containing layer component -->
    </zeejs-layer>
    <zeejs-layer style="/* bound to window or reference element */">
        <!-- layer content -->
    </zeejs-layer>
</div>
```

**nesting code example:**

```html
<script>
    import { Layer } from '@zeejs/svelte';
</script>

<div>
    <Layer>
        <!-- layer A content -->
        <Layer><!-- layer B content --></Layer>
    </Layer>
</div>
```

will output (assuming render in the application layer):

```html
<div>
    <zeejs-layer>
        <!-- application code containing layer component -->
    </zeejs-layer>
    <zeejs-layer>
        <!-- layer A content -->
    </zeejs-layer>
    <zeejs-layer>
        <!-- layer B content -->
    </zeejs-layer>
</div>
```

### `<Modal>` component

The modal primitive display content that is not affected by the scroll of lower layers.

**props:**

| name                  | type                                                                                                           | default  | required | description                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `backdrop`            | "none" \| "block" \| "hide"                                                                                    | "block"  | false    | background behavior; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#backdrop)                                 |
| `position`            | "topLeft" \| "top" \| "topRight" \| "left" \| "center" \| "right" \| "bottomLeft" \| "bottom" \| "bottomRight" | "center" | false    | fixed align position                                                                                                                        |
| `show`                | boolean                                                                                                        | true     | false    | flag if the layer should be displayed                                                                                                       |
| `onClickOutside`      | (target: EventTarget) => void                                                                                  |          | false    | invoked on click outside; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#click-outside)                       |
| `onMouseIntersection` | (isInside: boolean) => void                                                                                    |          | false    | invoked when mouse leaves or enters layer; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#mouse-intersection) |
| `onFocusChange`       | (isFocused: boolean) => void                                                                                   |          | false    | invoked when focus is moved into/out of layer; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#focus-change)   |
| `onEscape`            | (event: KeyboardEvent) => void                                                                                 |          | false    | invoked when escape is pressed; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#escape)                        |
| `class`               | string                                                                                                         | ""       | false    | CSS class name to add to the modal box                                                                                                      |
| `style`               | React.CSSProperties                                                                                            | {}       | false    | CSS inline style to add to the modal box                                                                                                    |

### `<Tooltip>` component

The tooltip primitive displays hovered content that is bound to the UI that opened it, usually used to label or describe it.

**props:**

| name         | type                                                | default  | required                 | description      |
| ------------ | --------------------------------------------------- | -------- | ------------------------ | ---------------- |
| `mouseDelay` | number                                              | 500      | delay for mouse out / in |                  |
| `positionX`  | "before" \| "start" \| "center" \| "end" \| "after" | "center" | false                    | align X position |
| `positionY`  | "before" \| "start" \| "center" \| "end" \| "after" | "before" | false                    | align X position |

### `<Popover>` component

The modal primitive display content that is not affected by the scroll of lower layers while being bound to the UI the opened it.

**props:**

| name                  | type                                                | default  | required | description                                                                                                                                 |
| --------------------- | --------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `backdrop`            | "none" \| "block" \| "hide"                         | "block"  | false    | background behavior; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#backdrop)                                 |
| `positionX`           | "before" \| "start" \| "center" \| "end" \| "after" | "center" | false    | align X position                                                                                                                            |
| `positionY`           | "before" \| "start" \| "center" \| "end" \| "after" | "after"  | false    | align Y position                                                                                                                            |
| `avoidAnchor`         | boolean                                             | false    | false    | attempt to not overlap the anchor that opened it while pushed in by overflow                                                                |
| `matchWidth`          | boolean                                             | false    | false    | force the popover box to be in the width of the anchor                                                                                      |
| `matchHeight`         | boolean                                             | false    | false    | force the popover box to be in the height of the anchor                                                                                     |
| `show`                | boolean                                             | true     | false    | flag if the layer should be displayed                                                                                                       |
| `onClickOutside`      | (target: EventTarget) => void                       |          | false    | invoked on click outside; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#click-outside)                       |
| `ignoreAnchorClick`      | boolean | false | false    | when true click on anchor does not invoke `onClickOutside` handler |
| `onMouseIntersection` | (isInside: boolean) => void                         |          | false    | invoked when mouse leaves or enters layer; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#mouse-intersection) |
| `onFocusChange`       | (isFocused: boolean) => void                        |          | false    | invoked when focus is moved into/out of layer; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#focus-change)   |
| `onEscape`            | (event: KeyboardEvent) => void                      |          | false    | invoked when escape is pressed; [see docs](https://github.com/idoros/zeejs/blob/master/docs/documentation.md#escape)                        |
| `onDisplayChange`     | (isPositioned: boolean) => void                     |          | false    | invoked when the popover is displayed (after positioning) or removed from DOM                                                               |
| `class`               | string                                              | ""       | false    | CSS class name to add to the popover box                                                                                                    |
| `style`               | React.CSSProperties                                 | {}       | false    | CSS inline style to add to the popover box                                                                                                  |
