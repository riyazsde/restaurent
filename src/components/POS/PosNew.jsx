import React from 'react';
import Pos from './Pos';

/**
 * PosNew was an early prototype now superseded by the TanStack-Query enabled Pos component.
 * Re-exporting Pos ensures full backward compatibility and query consistency across the app.
 */
const PosNew = (props) => {
    return <Pos {...props} />;
};

export default PosNew;
