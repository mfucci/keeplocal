/**
 * Popup menu attached to a burger icon.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

import { IconButton, Menu, MenuItem, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

type Props = {
    items: {label: string, handler: () => void}[],
};
type State = {
    open: boolean,
};

export class PopupMenu extends React.Component<Props, State> {
    private readonly anchorRef = React.createRef<HTMLButtonElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            open: false,
        };
    }

    render() {
        const { open, items } = {...this.state, ...this.props};
        return (
            <React.Fragment>
                <IconButton ref={this.anchorRef} size="large" color="inherit" aria-label="menu" aria-controls="menu-appbar" aria-haspopup="true" onClick={() => this.setState({open: true})}>
                    <MenuIcon />
                </IconButton>
                <Menu
                    anchorEl={this.anchorRef.current}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    keepMounted
                    open={open}
                    onClose={() => this.setState({open: false})}
                    >
                    
                    {items.map(({label, handler}) => 
                        <MenuItem key={label} onClick={() => { this.setState({open: false}); handler(); }}>
                            <Typography textAlign="center">{label}</Typography>
                        </MenuItem>
                    )}
                </Menu>
            </React.Fragment>
        );
    }
}
