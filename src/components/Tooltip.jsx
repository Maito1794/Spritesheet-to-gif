import React from 'react';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';

function TooltipComponent(props) {
    const { placement, data, type } = props;

    return (
        <Tooltip title={
            <div style={{ whiteSpace: 'pre-line' }}>{data}</div>
        }
            placement={placement}>
            {type === 'info' ?
                <InfoOutlinedIcon className="pb-1 mx-2" />
                :
                <HelpOutlineOutlinedIcon className="pb-1 mx-2" />
            }
        </Tooltip>
    );
}


export default TooltipComponent;