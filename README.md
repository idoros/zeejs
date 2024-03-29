<div align="center">
    <img alt="zeejs" src="https://raw.githubusercontent.com/idoros/zeejs/master/packages/site/media/logo.svg" />
    <p>Simple API to create multi layered UI</p>
</div>

<hr/>

<img alt="test status" src="https://github.com/idoros/zeejs/workflows/test/badge.svg" />

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
-   **components** - published for multiple libraries / frameworks ([React](https://github.com/idoros/zeejs/tree/master/packages/react), [Svelte](https://github.com/idoros/zeejs/tree/master/packages/svelte) & [more to come...](https://github.com/idoros/zeejs/issues/13))

## how to start

-   [read the docs](./docs/documentation.md)
-   pick your renderer:

| Package                     | Published                                                                                                                           | Size                                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [React](./packages/react)   | [![npm version](https://badgen.net/npm/v/@zeejs/react?label=@zeejs/react&cache=300)](https://www.npmjs.com/package/@zeejs/react)    | [![npm bundle size](https://badgen.net/bundlephobia/minzip/@zeejs/react?label=minzip&cache=300)](https://bundlephobia.com/result?p=@zeejs/react)   |
| [Svelte](./packages/svelte) | [![npm version](https://badgen.net/npm/v/@zeejs/svelte?label=@zeejs/svelte&cache=300)](https://www.npmjs.com/package/@zeejs/svelte) | [![npm bundle size](https://badgen.net/bundlephobia/minzip/@zeejs/svelte?label=minzip&cache=300)](https://bundlephobia.com/result?p=@zeejs/svelte) |

## caveats

The main issue with displacing DOM is that there is no way to tell the browser that the content inside a layer is meant to be nested inside the origin of the layer.

This is notable in 2 areas:

-   **Events** propagation between layers (unless specifically handled by the renderer (e.g. [React native event propagation within Portal](https://reactjs.org/docs/portals.html#event-bubbling-through-portals)).
-   **styling** with CSS selectors across layers.

## future road map

-   **ARIA support** - build in accessibility support
-   **style support** - control overlay, tooltip/popover arrow
-   **ordering logic** - application level re-ordering of layers
