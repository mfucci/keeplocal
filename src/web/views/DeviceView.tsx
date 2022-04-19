import React from "react";
import { useParams } from "react-router-dom";

import { Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormGroup, Grid, Icon, InputLabel, MenuItem, Paper, Select, Switch, TextField, Typography } from "@mui/material";

import DeleteIcon from '@mui/icons-material/Delete';

import { DEVICE_CATEGORY_ICONS } from "../components/DeviceCategoryIcons";
import { DEVICE_CATEGORY_LABELS } from "../components/DeviceCategoryLabels";
import { PERMISSION_LABELS } from "../components/PermissionLabels";
import { EditableLabel } from "../components/EditableLabel";
import { NavigateContext } from "../components/NavigateContext";
import { Device } from "../models/Device";
import { DeviceGroup } from "../models/DeviceGroup";
import { DEVICE_CATEGORIES } from "../models/DeviceCategories";
import { PERMISSIONS } from "../models/Permissions";
import { Record } from "../database/Record";
import { Database } from "../../database/Database";

type Props = {
    id: string,
};
type State = {
    confirmDelete: boolean,
    newGroupName?: string,
    addGroup: boolean,
};

const GroupLabel = ({label}: {label: string}) => <Typography sx={{ mt: 0.5, ml: 2, mb: 1 }} color="text.secondary" display="block" variant="subtitle1">{label}</Typography>;

export class DeviceView extends React.Component<Props, State> {
    static contextType = NavigateContext;
    declare context: React.ContextType<typeof NavigateContext>;

    constructor(props: Props) {
        super(props);
        this.state = {
            confirmDelete: false,
            addGroup: false,
        };
    }

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

        const groups = await database.get<DeviceGroup[]>("/groups");
        const newGroups = groups?.filter(group => group.id !== groupId);
        await database.set("/groups", newGroups);
    }

    private async addGroup(database: Database, updater: ((update: Partial<Device>) => void)) {
        const { id, newGroupName } = { ...this.props, ...this.state };
        if (newGroupName === undefined || newGroupName === "" ) return;
        
        const groups = await database.get<DeviceGroup[]>("/groups") ?? [];
        const groupIds = groups.map(group => group.id);
        
        var groupId = 1;
        while (groupIds.indexOf(groupId) !== -1) {
            groupId++;
        }
        groups.push({id: groupId, name: newGroupName});
        await database.set("/groups", groups);

        updater({groupId});
        this.setState({addGroup: false});
    }

    render() {
        const { confirmDelete, addGroup, id } = { ...this.props, ...this.state };
        return (
            <Record<Device> id={`/device/${id}`} key={id} render={({ name, category = DEVICE_CATEGORIES.UNKNOWN, vendor, model, mac, ip, online, hostname, permissions, groupId = 0 }, updater, database) => 
                <Grid container spacing={3} columns={{ xs: 6, md: 12 }}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Icon color="warning" sx={{ width: 60, height: 60 }}>
                                    {React.createElement(DEVICE_CATEGORY_ICONS[category], { sx: { width: 40, height: 40 } })}
                                </Icon>
                                <Typography gutterBottom variant="h4" component="div"><EditableLabel initialValue={name} onChange={name => updater({name})} /></Typography>
                                <div style={{lineHeight: "36px"}}>Vendor: <EditableLabel initialValue={vendor} onChange={vendor => updater({vendor})} /></div>
                                <div style={{lineHeight: "36px"}}>Model: <EditableLabel initialValue={model} onChange={model => updater({model})} /></div>
                                <div style={{lineHeight: "36px"}}>Category:
                                    <FormControl variant="standard" sx={{ marginLeft: "5px" }}>
                                        <Select value={category} label="Category" onChange={({target: {value}}) => updater({category: value as DEVICE_CATEGORIES})}>
                                            {(Object.entries(DEVICE_CATEGORY_LABELS) as [DEVICE_CATEGORIES, string][]).map(([category, label]) =>
                                                <MenuItem key={category} value={category}>{label}</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div style={{lineHeight: "36px"}}>Group:
                                    <Record<DeviceGroup[]> id="/groups" render={groups => 
                                        <FormControl variant="standard" sx={{ marginLeft: "5px" }}>
                                            <Select value={groupId} label="Group" onChange={({target: {value}}) => updater({groupId: value as number})}>
                                                {groups.map(({id, name}) =>
                                                    <MenuItem key={id} value={id}>{name}</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    } />
                                    <Button onClick={() => this.setState({addGroup: true})}>Add group</Button>
                                    <Dialog open={addGroup} onClose={()=>this.setState({confirmDelete: false})} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                                        <DialogTitle>Add a group</DialogTitle>
                                        <DialogContent>
                                            <TextField sx={{margin: "5px"}} label="Name" variant="outlined" onChange={({target: {value: newGroupName}}) => this.setState({newGroupName})} />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={()=>this.setState({addGroup: false})}>Cancel</Button>
                                            <Button onClick={()=>this.addGroup(database, updater)} autoFocus>Add</Button>
                                        </DialogActions>
                                    </Dialog>
                                    <Button disabled={groupId === 0} onClick={() => this.deleteGroup(groupId, database)}>Delete group</Button>
                                </div>
                            </CardContent>
                            <CardActions>
                                <Button variant="outlined" startIcon={<DeleteIcon />} color="error" onClick={()=>this.setState({confirmDelete: true})}>Delete</Button>
                                <Dialog open={confirmDelete} onClose={()=>this.setState({confirmDelete: false})} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                                    <DialogTitle>Are you sure you want to delete this device?</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Deleting the device will delete all data associated with this device.
                                            If this device requests to join the network again, it will have a default configuration.
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={()=>this.deleteDevice(database)}>Yes</Button>
                                        <Button onClick={()=>this.setState({confirmDelete: false})} autoFocus>No</Button>
                                    </DialogActions>
                                </Dialog>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card style={{height: "100%"}}>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div" color="primary">Permissions</Typography>
                                <FormGroup>
                                    {Object.entries(permissions).length === 0 ?
                                        <React.Fragment>
                                            Permissions cannot be controlled on this device.
                                        </React.Fragment>
                                    :
                                        <React.Fragment>
                                            {(Object.entries(permissions) as [PERMISSIONS, boolean][]).map(([permission, state]) =>
                                                <FormControlLabel key={permission} control={
                                                    <Switch checked={state} onChange={(event, checked) => updater({permissions: {...permissions, [permission]: checked}})}/>
                                                } label={PERMISSION_LABELS[permission]} />
                                            )}
                                        </React.Fragment>
                                    }
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
            } />
        );
    }
}

export const DeviceViewRouter = () => {
    const { id } = useParams();
    if (id === undefined) throw new Error("Missing device id");
    return <DeviceView id={id} />
}
