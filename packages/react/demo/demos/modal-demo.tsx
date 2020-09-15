import { getUniqueId } from '../unique-id';
import { Box } from '../box';
import { PositionInputButton } from '../position-input/position-input';
import { Modal } from '@zeejs/react';
import type { ModalPosition } from '@zeejs/react';
import React from 'react';

type ModalProps = Parameters<typeof Modal>[0];

export const ModalDemo = ({ children }: { children: React.ReactNode }) => {
    const id = React.useMemo(() => getUniqueId(), []);
    const [modalData, updateLayer] = React.useState({
        isOpen: false,
        title: `modal title`,
        position: `center` as ModalPosition,
        backdrop: `hide` as ModalProps['backdrop'],
        fixedSize: true,
    });

    const formSubmit = React.useCallback(
        (event: React.FormEvent) => {
            event.preventDefault();
            updateLayer({
                ...modalData,
                isOpen: true,
            });
        },
        [modalData]
    );

    const closeModal = React.useCallback(() => {
        updateLayer({
            isOpen: false,
            title: modalData.title,
            position: modalData.position,
            backdrop: `hide`,
            fixedSize: true,
        });
    }, [modalData]);

    return (
        <>
            <h2>Modal</h2>
            {modalData.isOpen ? (
                <span>
                    modal "{modalData.title}" is open
                    <Modal
                        position={modalData.position}
                        backdrop={modalData.backdrop}
                        className={
                            `ModalDemo__modal ` + modalData.fixedSize ? `ModalDemo--fixedSize` : ``
                        }
                    >
                        <Box shadow className="ModalDemo__modalContainer">
                            <h2>{modalData.title}</h2>
                            <details className="ModalDemo__shrinkable">
                                <summary>show demos</summary>
                                {children}
                            </details>
                            <button type="button" onClick={closeModal}>
                                close modal
                            </button>
                        </Box>
                    </Modal>
                </span>
            ) : null}

            <form onSubmit={formSubmit} style={{ display: modalData.isOpen ? `none` : `` }}>
                <label htmlFor={id + `-title`}>title</label>
                <input
                    id={id + `-title`}
                    value={modalData.title}
                    onChange={({ target }) =>
                        updateLayer((data) => ({ ...data, title: target.value }))
                    }
                ></input>
                <label htmlFor={id + `-position`}>position</label>
                <PositionInputButton
                    id={id + `-position`}
                    value={modalData.position}
                    onChange={(position) => updateLayer((data) => ({ ...data, position }))}
                />
                <label htmlFor={id + `-backdrop`}>backdrop</label>
                <select
                    id={id + `-backdrop`}
                    value={modalData.backdrop}
                    onChange={({ target }) =>
                        updateLayer((data) => ({
                            ...data,
                            backdrop: target.value as ModalProps['backdrop'],
                        }))
                    }
                >
                    {[`none`, `block`, `hide`].map((backdrop) => (
                        <option key={backdrop} value={backdrop}>
                            {backdrop}
                        </option>
                    ))}
                </select>
                <label htmlFor={id + `-size`}>fixed size</label>
                <input
                    type="checkbox"
                    id={id + `-size`}
                    checked={modalData.fixedSize}
                    onChange={({ target }) =>
                        updateLayer((data) => ({ ...data, fixedSize: target.checked }))
                    }
                ></input>
                <button type="submit">Open modal</button>
            </form>
        </>
    );
};
