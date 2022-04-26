/** 
 * Page to view / edit a device.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useParams } from "react-router-dom";

import { Button, Card, CardActions, CardContent, FormControl, FormControlLabel, FormGroup, Grid, Icon, MenuItem, Select, Switch, Typography } from "@mui/material";

import DeleteIcon from '@mui/icons-material/Delete';

import { DeviceCategoryIcon, DEVICE_CATEGORIES_LABELS } from "../components/DeviceCategoryUi";
import { PERMISSION_LABELS } from "../components/PermissionLabels";
import { EditableLabel } from "../components/EditableLabel";
import { NavigateContext } from "../components/NavigateContext";

import { Device, DEVICE_KEY_BY_ID, DEVICE_GROUP_LIST_KEY } from "../models/Device";
import { Group } from "../models/Group";
import { DEVICE_CATEGORIES } from "../models/DeviceCategories";
import { DEVICE_PERMISSIONS } from "../models/DevicePermissions";

import { Record } from "../database/Record";
import { Database } from "../../database/Database";

import { Iterate, IterateObject } from "../react/Iterate";
import { If } from "../react/If";
import { AddGroupDialog } from "../common/AddGroupDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";

type Props = {
    id: string,
};
type State = {
};

const GroupLabel = ({label}: {label: string}) => <Typography sx={{ mt: 0.5, ml: 2, mb: 1 }} color="text.secondary" display="block" variant="subtitle1">{label}</Typography>;
const SectionCard = ({children}: {children: any}) => (
    <Grid item xs={12}>
        <Card>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    </Grid>
);

export class DeviceDetailView extends React.Component<Props, State> {
    static contextType = NavigateContext;
    declare context: React.ContextType<typeof NavigateContext>;

    private addGroupDialog = React.createRef<AddGroupDialog>();
    private deleteDeviceConfirmDialog = React.createRef<ConfirmDialog>();

    private async deleteDevice(database: Database) {
        const { id, navigate } = { ...this.props, ...this.context };
        const newDeviceIds = (await database.get<string[]>("/devices"))?.filter(deviceId => deviceId !== id);
        await database.set("/devices", newDeviceIds);
        await database.set(id, undefined);
        navigate("/");
    }

    private async deleteGroup(groupId: number, database: Database) {
        const deviceIds = await database.get<string[]>("/devices");
        if (deviceIds === undefined) return;
        await Promise.all(deviceIds.map(async id => {
            const key = `/device/${id}`;
            const device = await database.get<Device>(key);
            if (device === undefined || device.groupId !== groupId) return;
            device.groupId = 0;
            await database.set(key, device);
        }));

        const groups = await database.get<Group[]>("/groups");
        const newGroups = groups?.filter(group => group.id !== groupId);
        await database.set("/groups", newGroups);
    }

    render() {
        const { id } = { ...this.props, ...this.state };
        return (
            <Record<Device> id={DEVICE_KEY_BY_ID(id)}>{({ name, category = DEVICE_CATEGORIES.UNKNOWN, vendor, model, mac, ip, online, hostname, permissions, groupId = 0 }, updater, database) => 
                <Grid container spacing={3} columns={{ xs: 6, md: 12 }}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Icon color="warning" sx={{ width: 60, height: 60 }}>
                                    <DeviceCategoryIcon category={category} sx={{ width: 40, height: 40 }} />
                                </Icon>
                                <Typography gutterBottom variant="h4" component="div"><EditableLabel initialValue={name} onChange={name => updater({name})} /></Typography>
                                <div style={{lineHeight: "36px"}}>Vendor: <EditableLabel initialValue={vendor} onChange={vendor => updater({vendor})} /></div>
                                <div style={{lineHeight: "36px"}}>Model: <EditableLabel initialValue={model} onChange={model => updater({model})} /></div>
                                <div style={{lineHeight: "36px"}}>Category:
                                    <FormControl variant="standard" sx={{ marginLeft: "5px" }}>
                                        <Select value={category} label="Category" onChange={({target: {value}}) => updater({category: value as DEVICE_CATEGORIES})}>
                                            <IterateObject<DEVICE_CATEGORIES, string> object={DEVICE_CATEGORIES_LABELS}>
                                                {(category, label) => <MenuItem key={category} value={category}>{label}</MenuItem>}
                                            </IterateObject>
                                        </Select>
                                    </FormControl>
                                </div>
                                <div style={{lineHeight: "36px"}}>Group:
                                    <Record<Group[]> id={DEVICE_GROUP_LIST_KEY}>{groups => 
                                        <FormControl variant="standard" sx={{ marginLeft: "5px" }}>
                                            <Select value={groupId} label="Group" onChange={({target: {value}}) => updater({groupId: value as number})}>
                                                <Iterate array={groups}>
                                                    {({id, name}) => <MenuItem key={id} value={id}>{name}</MenuItem>}
                                                </Iterate>
                                            </Select>
                                        </FormControl>
                                    }</Record>
                                    <Button onClick={() => this.addGroupDialog.current?.open()}>Add group</Button>
                                    <AddGroupDialog ref={this.addGroupDialog} onNewGroup={groupId => updater({groupId})} />
                                    <Button disabled={groupId === 0} onClick={() => this.deleteGroup(groupId, database)}>Delete group</Button>
                                </div>
                            </CardContent>
                            <CardActions>
                                <Button variant="outlined" startIcon={<DeleteIcon />} color="error" onClick={()=>this.deleteDeviceConfirmDialog.current?.open()}>Delete</Button>
                                <ConfirmDialog ref={this.deleteDeviceConfirmDialog} title="Are you sure you want to delete this device?"
                                    message="Deleting the device will delete all data associated with this device.\nIf this device requests to join the network again, it will have a default configuration." 
                                    onConfirm={()=>this.deleteDevice(database)}/>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card style={{height: "100%"}}>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div" color="primary">Permissions</Typography>
                                <FormGroup>
                                    <If condition={Object.entries(permissions).length === 0} otherwise="Permissions cannot be controlled on this device.">
                                        <IterateObject<DEVICE_PERMISSIONS, string> object={PERMISSION_LABELS}>
                                            {(permission, label) =>
                                                <If condition={permissions[permission] !== undefined}>
                                                    <FormControlLabel key={permission} control={
                                                        <Switch checked={permissions[permission]} onChange={(event, checked) => updater({permissions: {...permissions, [permission]: checked}})}/>
                                                    } label={label} />
                                                </If>
                                            }
                                        </IterateObject>
                                    </If>
                                </FormGroup>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card style={{height: "100%"}}>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div" color="primary">Network</Typography>
                                <div>MAC address: {mac}</div>
                                <div>IP address: {ip}</div>
                                <div>Status: {online ? "online" : "offline"}</div>
                                <div>Hostname: {hostname}</div>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            }</Record>
        );
    }
}

export const DeviceDetailViewRouter = () => {
    const { id } = useParams();
    if (id === undefined) throw new Error("Missing device id");
    return <DeviceDetailView id={id} />
}
