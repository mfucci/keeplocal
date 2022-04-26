/**
 * Add a new device group.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { DatabaseContext } from "../database/DatabaseContext";
import { Group } from "../models/Group";
import { DEVICE_GROUP_LIST_KEY } from "../models/Device";

type Props = {
    onNewGroup: (groupId: number) => void,
};
type State = {
    open: boolean,
    groupName: string,
};

export class AddGroupDialog extends React.Component<Props, State> {
    static contextType = DatabaseContext;
    declare context: React.ContextType<typeof DatabaseContext>;

    constructor(props: Props) {
        super(props);

        this.state = {
            open: false,
            groupName: "",
        }
    }

    open() {
        this.setState({open: true});
    }

    handleCancel() {
        this.setState({open: false});
    }

    async handleAddGroup() {
        const { databaseManager, groupName, onNewGroup } = { ...this.context, ...this.state, ...this.props };
        if (groupName === "") return;
        const database = await databaseManager.getDatabase();
        const groups = await database.get<Group[]>(DEVICE_GROUP_LIST_KEY) ?? [];
        const groupIds = groups.map(group => group.id);
        
        // Find the first available group id
        var groupId = 1;
        while (groupIds.indexOf(groupId) !== -1) {
            groupId++;
        }
        groups.push({id: groupId, name: groupName});
        await database.set(DEVICE_GROUP_LIST_KEY, groups);

        this.setState({open: false});
        onNewGroup(groupId);
    }
    
    render() {
        const { open, groupName, onNewGroup } = { ...this.props, ...this.state };
        return (
            <Dialog open={open} onClose={()=>this.handleCancel()} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle>Add a group</DialogTitle>
                <DialogContent>
                    <TextField sx={{margin: "5px"}} label="Name" variant="outlined" onChange={({target: {value: groupName}}) => this.setState({groupName})} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>this.handleCancel()}>Cancel</Button>
                    <Button onClick={()=>this.handleAddGroup()} autoFocus>Add</Button>
                </DialogActions>
            </Dialog>
        );
    }
}
