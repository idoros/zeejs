<script>
    import { Root } from '../../src';
    import { Position } from '../position-input/position';
    import Modal from '../layers/modal.svelte';
    import Box from '../box.svelte';
    import PositionInputButton from '../position-input/position-input-button.svelte';
    import { getUniqueId } from '../unique-id';

    const id = getUniqueId();

    let modalData = {
        isOpen: false,
        title: `modal title`,
        position: Position.center,
        backdrop: `hide`,
        fixedSize: true
    };

    function formChange(event) {
        const data = new FormData(event.currentTarget);
        modalData = {
            isOpen: false,
            title: data.get(`title`),
            position: modalData.position,
            backdrop: data.get(`backdrop`),
            fixedSize: data.get(`fixedSize`)
        };
    }

    function formSubmit(event) {
        event.preventDefault();
        modalData = {
            ...modalData,
            isOpen: true
        };
    }

    function closeModal() {
        modalData = {
            isOpen: false,
            title: modalData.title,
            position: modalData.position,
            backdrop: `hide`,
            fixedSize: true
        };
    }

    let modalClassName = ``;
</script>

<style>
    :global(.modalDemo--fixedSize) {
        min-width: 30vw;
        min-height: 30vh;
    }
    :global(.modalDemo__modalContainer) {
        display: grid;
        grid-template-rows: auto 1fr auto;
    }
    .modalDemo__shrinkable {
        overflow: auto;
    }
</style>

<h2>Modal</h2>

{#if modalData.isOpen}
    <span>
        modal "{modalData.title}" is open
        <Modal
            className="modalDemo__modal {modalData.fixedSize ? `modalDemo--fixedSize` : ``}"
            position={modalData.position}
            backdrop={modalData.backdrop}>
            <Box shadow className="modalDemo__modalContainer">
                <h2>{modalData.title}</h2>
                <details class="modalDemo__shrinkable">
                    <summary style="position: sticky; top: 0;">show demos</summary>
                    <slot />
                </details>
                <button type="button" on:click={closeModal}>close modal</button>
            </Box>
        </Modal>
    </span>
{/if}

<form
    on:change={formChange}
    on:submit={formSubmit}
    style="display: {modalData.isOpen ? `none` : ``}">
    <label for={id + `-title`}>title</label>
    <input id={id + `-title`} name="title" value={modalData.title} />
    <label for={id + `-position`}>position</label>
    <PositionInputButton
        id={id + `-position`}
        value={modalData.position}
        onChange={position => {
            modalData = { ...modalData, position };
        }} />
    <label for={id + `-backdrop`}>backdrop</label>
    <select id={id + `-backdrop`} name="backdrop" value={modalData.backdrop}>
        <option value="none">none</option>
        <option value="block">block</option>
        <option value="hide">hide</option>
    </select>
    <label for={id + `-size`}>fixed size</label>
    <input type="checkbox" id={id + `-size`} name="fixedSize" checked={modalData.fixedSize} />
    <button type="submit">Open modal</button>
</form>
