import React from 'react';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import Tooltip from '@mui/material/Tooltip';

function TooltipComponent(props) {
    const { placement, data } = props;

    return (
        <Tooltip title={
            <div style={{ whiteSpace: 'pre-line' }}>{data}</div>
        }
            placement={placement}>
            <HelpOutlineOutlinedIcon className="pb-1 ml-2" />
        </Tooltip>
    );
}


export default TooltipComponent;