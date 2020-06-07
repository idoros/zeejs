import { Root, Layer } from '@zeejs/react';
import React from 'react';
import ReactServer from 'react-dom/server';

export default () => {
    return ReactServer.renderToString(
        <Root>
            <div id="root-node">
                <Layer>
                    <div id="layer-node" />
                </Layer>
            </div>
        </Root>
    );
};
