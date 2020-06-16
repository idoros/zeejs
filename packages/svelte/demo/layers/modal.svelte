<script>
    import { Layer } from '../../src';
    import { Position, getAbsolutePosition } from '../position-input/position';

    export let className = ``;
    export let position = Position.center;
    export let backdrop = `hide`;
    export let style = ``;

    let alignStyle = Object.entries(getAbsolutePosition(position)).reduce((s, [prop, value]) => {
        return (s += `${prop}: ${value};`);
    }, style + `;`);
</script>

<style>
    .Modal__root {
        display: grid;
        grid-template-rows: minmax(0, 1fr);
        grid-template-columns: minmax(0, 1fr);
        max-height: 100vh;
        max-width: 100vw;
    }
</style>

<Layer overlap="window" {backdrop}>
    <div class="Modal__root {className}" style={alignStyle}>
        <slot />
    </div>
</Layer>
