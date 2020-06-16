<p align="center">

![zeejs](https://github.com/idoros/zeejs/packages/site/media/logo.svg)

**zeejs Svelte** - simple API to create multi layered UI

![test status](https://github.com/idoros/zeejs/workflows/test/badge.svg)
[![npm version](https://img.shields.io/npm/v/@zeejs/svelte.svg?label=@zeejs/svelte)](https://www.npmjs.com/package/@zeejs/svelte)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@zeejs/svelte?label=minzip)
</p>

## what's in the box

-   **layers** - automatic ordering of nested layers
-   **backdrop** - hide / block background **or** keep a layer as part of the flow
-   **focus**
    - <kbd>Tab</kbd> between layers
    - trap focus above backdrop
    - re-focus when blocking layer close
-   **click outside** - notification for click outside of logical layer
-   **server rendering** - single pass nested rendering of layers in the server
-   **typed** - built with [TypeScript](https://www.typescriptlang.org/)
-   **tested** - tested in a browser

## how to use

This document describes the zeejs Svelte usage, For a more in depth overview of `zeejs`, please see the general [documentation](http://www.github.com/idoros/zeejs/docs/documentation.md).

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

| name             | type                        | default  | required | description                                                                                                  |
| ---------------- | --------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `backdrop`       | `'none' | 'block' | 'hide'` | 'none'   | false    | background behavior; [see docs](http://www.github.com/idoros/zeejs/docs.documentation.md#backdrop)           |
| `overlap`        | `'window' | HTMLElement`    | 'window' | false    | layer bounds reference                                                                                       |
| `onClickOutside` | `() => void`                |          | false    | invoked on click outside; [see docs](http://www.github.com/idoros/zeejs/docs.documentation.md#click-outside) |

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
