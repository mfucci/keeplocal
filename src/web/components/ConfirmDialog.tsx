/**
 * Generic confirmation dialog.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

type Props = {
    title: string,
    message: string,
    onConfirm: () => void,
};
type State = {
    open: boolean,
};

export class ConfirmDialog extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            open: false,
        }
    }

    open() {
        this.setState({open: true});
    }

    handleCancel() {
        this.setState({open: false});
    }

    async handleConfirm() {
        const { onConfirm } = this.props;
        this.setState({open: false});
        onConfirm();
    }
    
    render() {
        const { open, title, message } = { ...this.props, ...this.state };
        return (
            <Dialog open={open} onClose={()=>this.handleCancel()} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>this.handleConfirm()}>Yes</Button>
                    <Button onClick={()=>this.handleCancel()} autoFocus>No</Button>
                </DialogActions>
            </Dialog>
        );
    }
}
