# Documentation

**zeejs** is built as a pure javascript, html & css library with published wrappers for specific rendering libraries / frameworks. This document describes the general behavior and terminology under the hood.

> APIs for supported wrappers are located in their package README: [React](https://github.com/idoros/zeejs/tree/master/packages/react), [Svelte](https://github.com/idoros/zeejs/tree/master/packages/svelte)

## layers

Layers are the top elements containing the application DOM. Any layer can nest internal layers with the application or website main UI located under the `root layer`.

All layers are flatten out under a common wrapper element in order to control their visual and functional order.

> While usually the layers are ordered by their logical order, the actual order is set with `z-index`. The reason is that once a layer is appended to the DOM, it won't be removed for re-ordering, so that focus, selection & iframe state is preserved.

### layer origin

All layers, except the `root layer`, are generated at some point in their `parent layer` DOM. At that point an `origin element` is created for accessibility purposes and to allow SEO for server rendering.

## backdrop

The behavior and background behind a layer can be controlled with the layer `backdrop` configuration:

-   **`none`** - layer is part of the flow, the UI behind the layer is accessible and <kbd>Tab</kbd> will move the focus into and out of the layer according to the `origin element`.
-   **`hide`** - everything behind the layer is visually hidden and inert.
-   **`block`** - everything behind the layer is visible, but inert, and cannot be focused or clicked.

Multiple layers can be interactive above a backdrop _(e.g. a floating options menu opening up above a blocking modal)_.

Notice that it is possible to simultaneously have a lower layer that hides everything behind it with a higher layer that only blocks the background.

> When layers with backdrop are created, there are 2 DOM elements that are inserted between the layers to act as a visual and functional blocking layers.
>
> The backdrop elements are appended in the DOM to be located just before the top backdrop layer at any given moment.

## focus

**tabbing**

When tabbing between elements, **zeejs** tries to keep the logical order of navigation according to the layer origin. That means that when <kbd>Tab</kbd> is pressed the focus might move into or out of a layer _(reversed for <kbd>Shift+Tab</kbd>)_:

-   When the current focus is just before an `origin element` then the first `tabbable` element inside the layer is focused.
-   When the current focus is on the edge of a layer (no other `tabbable` element to move to), then the next `tabbable` element after the `origin element` of the layer is focused.

There are 2 exceptions to this behavior:

1. When the `edge element` in on a layer with a backdrop, the focus is trapped and moved to the first element of that layer.
2. When the `edge element` is on the `root layer` the tab order acts like a focus trap (this will probably change in the future - [see issue here](https://github.com/idoros/zeejs/issues/11))

> Tabbable elements are not accessible to JavaScript by the browser and might be skipped _(ToDo: add best practices and workarounds)_

**re-focus**

When a layer with a backdrop is first opened, the focused element of the layer behind it is saved to the inert layer. Once a backdrop layer is closed, the new highest top layer with a previously saved focused element is re-focused.

> A saved focus element is only re-focused if it still have the same visible reference in the DOM. If not, then a fallback to a lower focused save is attempted.

**unknown focus**

In the event of a focus of an element behind a backdrop, the focus is moved to the first element of the first layer above the backdrop.

## click outside

When initiating a layer, an optional `onClickOutside` handler can be set. The handler is called for any click outside the logical DOM of the layer.

The handler is **called** for a click on:

-   a lower layer
-   a sibling layer or any of its nested layers
-   a backdrop behind the layer

The handler is **not called** for a click on:

-   a nested layer
-   a backdrop above the layer

## server rendering

For implementations that support SSR, the layer content is rendered into the `origin element` on the server, and then moved or re-rendered into the correct `layer element` later on the client.

## Terms & custom elements

-   **`root layer`** - the layer containing the main application or website DOM UI, which is always the bottom most layer.
-   **`layer element`** - the top level `<zeejs-layer>` element containing each layer DOM.
-   **`origin element`** - the `<zeejs-origin>` element marking the position that a layer originated from.
-   **`parent layer`** - the layer that the `origin element` of another layer is located at.
-   **`backdrop elements`** - the elements between layers that provide visual cover (`<zeejs-hide>`) and functional cover (`<zeejs-block>`).
-   **`tabbable`** - elements that can be focused by pressing <kbd>Tab</kbd>/<kbd>Shift+Tab</kbd>.
-   **`edge element`** - the last or first `tabbable` element in a layer.
