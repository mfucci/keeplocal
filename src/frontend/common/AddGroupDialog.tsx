/**
 * Add a new device group.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { GroupController } from "../controllers/GroupController";
import { GroupItem } from "../../common/models/Group";

type Props<T extends GroupItem> = {
    controller: GroupController<T>,
    onNewGroup: (groupId: string) => void,
};
type State = {
    open: boolean,
    groupName: string,
};

export class AddGroupDialog<T extends GroupItem> extends React.Component<Props<T>, State> {
    constructor(props: Props<T>) {
        super(props);

        this.state = {
            open: false,
            groupName: "",
        }
    }

    open() {
        this.setState({ open: true });
    }

    private handleCancel() {
        this.setState({ open: false });
    }

    private async handleAddGroup(controller: GroupController<T>) {
        const { groupName, onNewGroup } = { ...this.state, ...this.props };
        if (groupName === "") return;
        const groupId = await controller.addGroup(groupName);
        this.setState({ open: false });
        onNewGroup(groupId);
    }

    render() {
        const { open, controller } = { ...this.props, ...this.state };
        return (
            <Dialog open={open} onClose={() => this.handleCancel()} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle>Add a group</DialogTitle>
                <DialogContent>
                    <TextField sx={{ margin: "5px" }} label="Name" variant="outlined" onChange={({ target: { value: groupName } }) => this.setState({ groupName })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.handleCancel()}>Cancel</Button>
                    <Button onClick={() => this.handleAddGroup(controller)} autoFocus>Add</Button>
                </DialogActions>
            </Dialog>
        );
    }
}
