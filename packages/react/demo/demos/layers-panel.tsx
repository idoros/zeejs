import { Box } from '../box';
import { getUniqueId } from '../unique-id';
import { Modal } from '../layers/modal';
import { Dialog } from '../layers/dialog';
import { Position, PositionInputButton } from '../position-input/position-input';
import React, { useState, useCallback } from 'react';

const LayerType = ({ def, itemId }: { def: LayerItem; itemId: string }) => {
    const [position, setPosition] = React.useState(Position.center);

    switch (def.type) {
        case `modal`:
            return (
                <Modal {...def.props} position={position}>
                    <div>
                        <h2>
                            [{def.type}] {def.title}
                        </h2>
                        <button onClick={def.close}>X</button>
                    </div>
                    <label>
                        <span>position </span>
                        <PositionInputButton value={position} onChange={setPosition} />
                    </label>
                    <br />
                    <iframe
                        src="http://localhost:8080/main"
                        style={{ width: '50vw', height: '30vh' }}
                    ></iframe>
                    <LayersPanel />
                </Modal>
            );
        case `dialog`:
            return (
                <Dialog relativeTo={itemId}>
                    <Box>
                        <div>
                            <h2>
                                [{def.type}] {def.title}
                            </h2>
                        </div>
                        <LayersPanel />
                    </Box>
                </Dialog>
            );
    }
};

export const LayersPanel = ({
    className,
    style,
}: {
    className?: string;
    style?: React.CSSProperties;
}) => {
    const id = React.useMemo(() => getUniqueId(), []);
    const [layers, updateLayerList] = useState<LayerItem[]>([]);

    const addLayer = useCallback(
        (layerToAdd: LayerItem) => {
            layerToAdd.close = () => {
                updateLayerList((layers) => {
                    return layers.filter((layer) => !layer);
                });
            };
            updateLayerList([...layers, layerToAdd]);
        },
        [layers]
    );

    return (
        <div className={[`LayerList__root`, className].join(` `)} style={style}>
            {layers.length ? <h3>nested layers</h3> : null}
            <div className="LayerList__list">
                {layers.map((def) => {
                    const itemId = `layerItem-${id}-${def.id}`;
                    return (
                        <div key={def.id} id={itemId} style={{ borderBottom: `1px solid black` }}>
                            [{def.type}] {def.title}
                            <LayerType def={def} itemId={itemId} />
                        </div>
                    );
                })}
            </div>
            <LayerForm onSubmit={addLayer} />
        </div>
    );
};

//---------------------------

interface LayerDef {
    id: string;
    type: string;
    title: string;
    close: () => void;
}
interface ModalDef extends LayerDef {
    type: `modal`;
    props: any;
}
interface DialogDef extends LayerDef {
    type: `dialog`;
    props: any;
}
type LayerItem = ModalDef | DialogDef;

function getDefaultLayerItem(type: LayerItem['type']): LayerItem {
    if (type === `modal`) {
        return {
            id: getUniqueId(),
            type: `modal`,
            title: `new modal`,
            props: {
                backdrop: `hide`,
            },
            close: noop,
        };
    } else {
        return {
            id: getUniqueId(),
            type: `dialog`,
            title: `new dialog`,
            props: {
                backdrop: `none`,
            },
            close: noop,
        };
    }
}

interface LayerFormProps {
    className?: string;
    onSubmit: (layerDef: LayerItem) => void;
}

const LayerForm = ({ className, onSubmit }: LayerFormProps) => {
    const id = React.useMemo(() => getUniqueId(), []);
    const [editLayer, updateLayer] = useState<LayerItem>(getDefaultLayerItem(`modal`));

    const formChange = useCallback(
        (event) => {
            const data = new FormData(event.currentTarget);
            const type = data.get(id + `type`) as LayerItem['type'];
            if (type !== editLayer.type) {
                updateLayer(getDefaultLayerItem(type));
            } else {
                updateLayer({
                    ...editLayer,
                    title: data.get(`title`) as string,
                    props: {
                        backdrop: data.get(`backdrop`),
                    },
                });
            }
        },
        [editLayer]
    );

    const formSubmit = useCallback(
        (event: React.FormEvent) => {
            event.preventDefault();
            onSubmit(editLayer);
            updateLayer({
                ...editLayer,
                id: getUniqueId(),
            });
        },
        [editLayer, onSubmit]
    );
    return (
        <form
            onChange={formChange}
            onSubmit={formSubmit}
            className={[`LayerForm__root`, className].join(` `)}
            style={{
                display: `grid`,
            }}
        >
            <h3>Add layer</h3>
            <label>
                <input
                    type="radio"
                    name={id + `type`}
                    value="modal"
                    checked={editLayer.type === `modal`}
                    onChange={noop}
                ></input>
                Modal
            </label>
            <label>
                <input
                    type="radio"
                    name={id + `type`}
                    value="popup"
                    checked={editLayer.type === `dialog`}
                    onChange={noop}
                ></input>
                Dialog
            </label>
            <label>
                title<input name="title" value={editLayer.title} onChange={noop}></input>
            </label>
            <label>
                backdrop
                <select name="backdrop" value={editLayer.props.backdrop} onChange={noop}>
                    {[`none`, `block`, `hide`].map((backdrop) => (
                        <option key={backdrop} value={backdrop}>
                            {backdrop}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">Add</button>
        </form>
    );
};

const noop = () => {
    /**/
};
