import { Root } from '@zeejs/react';
import React from 'react';
import ReactServer from 'react-dom/server';

export default () => {
    return ReactServer.renderToString(<Root>content</Root>);
};
