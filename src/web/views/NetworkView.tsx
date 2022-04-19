import React, { ReactChild } from "react";
import { Button, Divider, Grid, IconButton, Paper, Typography } from "@mui/material";

import { Link } from "react-router-dom";
import { DEVICE_CATEGORY_ICONS } from "../components/DeviceCategoryIcons";
import { DEVICE_CATEGORIES } from "../models/DeviceCategories";
import { Device } from "../models/Device";
import { DeviceGroup } from "../models/DeviceGroup";
import { Record } from "../database/Record";
import { RecordArray } from "../database/RecordArray";
import { ArrayMap } from "../components/ArrayMap";
import { With } from "../components/With";
import { RenderIf } from "../components/RenderIf";
import { ArrowBack, ArrowDownward, ArrowForward, ArrowUpward } from "@mui/icons-material";
import { Database } from "../../database/Database";

type Props = {};
type State = {
    reorder: boolean
};

const SectionCard = ({children}: {children: ReactChild[] | ReactChild}) => (
    <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
             {children}
        </Paper>
    </Grid>
);

const GroupLabel = ({label, reorder}: {label: string, reorder: boolean}) => (
    <Typography sx={{ mt: 0.5, ml: 2, mb: 1 }} color="text.secondary" display="block" variant="subtitle1">
        {label}
        <RenderIf condition={reorder} render={() =>
            <React.Fragment>
                <IconButton size="small">
                    <ArrowUpward fontSize="inherit" />
                </IconButton>
                <IconButton size="small">
                    <ArrowDownward fontSize="inherit" />
                </IconButton>
            </React.Fragment>
        } />
    </Typography>
);

export class Network extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            reorder: false,
        }
    }

    private async moveCategoryUp(groupId: number, groups: DeviceGroup[], database: Database) {
        const newGroups: DeviceGroup[] = [];
        var toMoveGroup: DeviceGroup | undefined;
        for (var i=groups.length-1; i >=0; i--) {
            const group = groups[i];
            if (group.id === groupId) {
                toMoveGroup = group;
            } else {
                newGroups.unshift(group);
                if (toMoveGroup !== undefined) {
                    newGroups.unshift(toMoveGroup);
                    toMoveGroup = undefined;
                }
            }
        }

        if (toMoveGroup !== undefined) {
            newGroups.unshift(toMoveGroup);
        }

        await database.set("/groups", newGroups);
    }

    private async moveCategoryDown(groupId: number, groups: DeviceGroup[], database: Database) {
        const newGroups: DeviceGroup[] = [];
        var toMoveGroup: DeviceGroup | undefined;
        for (var i=0; i < groups.length; i++) {
            const group = groups[i];
            if (group.id === groupId) {
                toMoveGroup = group;
            } else {
                newGroups.push(group);
                if (toMoveGroup !== undefined) {
                    newGroups.push(toMoveGroup);
                    toMoveGroup = undefined;
                }
            }
        }

        if (toMoveGroup !== undefined) {
            newGroups.push(toMoveGroup);
        }

        await database.set("/groups", newGroups);
    }

    private async moveDeviceUp(groupId: number, deviceId: string, devices: Device[], database: Database) {
        // Put the debice before the previous device in this group
        const deviceIds: string[] = [];
        var deviceFound = false;
        var nextDeviceFound = false;
        for (var i=devices.length-1; i >=0; i--) {
            const {mac: id, groupId: deviceGroupId} = devices[i];
            if (id === deviceId) {
                deviceFound = true;
            } else {
                deviceIds.unshift(id);
                if (deviceFound && !nextDeviceFound && deviceGroupId === groupId) {
                    deviceIds.unshift(deviceId);
                    nextDeviceFound = true;
                }
            }
        }
        if (deviceFound && !nextDeviceFound) {
            // No previous device, insert at the beginning
            deviceIds.unshift(deviceId);
        }

        await database.set("/devices", deviceIds);

    }

    private async moveDeviceDown(groupId: number, deviceId: string, devices: Device[], database: Database) {
        // Put the debice after the next device in this group
        const deviceIds: string[] = [];
        var deviceFound = false;
        var nextDeviceFound = false;
        for (var i=0; i < devices.length; i++) {
            const {mac: id, groupId: deviceGroupId} = devices[i];
            if (id === deviceId) {
                deviceFound = true;
            } else {
                deviceIds.push(id);
                if (deviceFound && !nextDeviceFound && deviceGroupId === groupId) {
                    deviceIds.push(deviceId);
                    nextDeviceFound = true;
                }
            }
        }
        if (deviceFound && !nextDeviceFound) {
            // No next device, insert at the end
            deviceIds.push(deviceId);
        }

        await database.set("/devices", deviceIds);
    }

    render() {
        const { reorder } = this.state;

        return (
            <RecordArray<Device> id="/devices" itemIdMapper={id => `/device/${id}`} render={devices => 
                <Record<DeviceGroup[]> id="/groups" render={(groups, groupUpdater, database) => 
                    <Grid container spacing={3}>
                        <SectionCard>
                            {devices.length} devices, {devices.filter(device => device.online).length} online
                        </SectionCard>
    
                        <SectionCard>
                            <ArrayMap array={groups} render={({id: groupId, name}, groupIndex) =>
                                <With key={groupId} value={devices.filter(device => device.groupId === groupId)} render={devicesInGroup =>
                                    <RenderIf condition={devicesInGroup.length > 0} render={() =>
                                        <React.Fragment>
                                            <RenderIf condition={groupIndex > 0} render={() => <Divider />} />
                                            
                                            <Typography sx={{ mt: 0.5, ml: 2, mb: 1 }} color="text.secondary" display="block" variant="subtitle1">
                                                {name}
                                                <RenderIf condition={reorder} render={() =>
                                                    <React.Fragment>
                                                        <IconButton size="small" disabled={groupIndex === 0} onClick={() => this.moveCategoryUp(groupId, groups, database)}>
                                                            <ArrowUpward fontSize="inherit" />
                                                        </IconButton>
                                                        <IconButton size="small" disabled={groupIndex === groups.length - 1} onClick={() => this.moveCategoryDown(groupId, groups, database)}>
                                                            <ArrowDownward fontSize="inherit" />
                                                        </IconButton>
                                                    </React.Fragment>
                                                } />
                                            </Typography>

                                            <Grid container spacing={3} sx={{ mb: 1 }} columns={{ xs: 2, sm: 4, md: 8, lg: 10 }}>
                                                <ArrayMap array={devicesInGroup} render={({mac: deviceId, name, category = DEVICE_CATEGORIES.UNKNOWN}, deviceIndex) => 
                                                    <Grid key={deviceId} item xs={1} sx={{ width: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <IconButton color="warning" sx={{ width: 60, height: 60 }} component={Link} to={`/device/${deviceId}`}>
                                                            {React.createElement(DEVICE_CATEGORY_ICONS[category], { sx: { width: 40, height: 40 } })}
                                                        </IconButton>
                                                        {name}
                                                        <RenderIf condition={reorder} render={() =>
                                                            <div>
                                                                <IconButton size="small" disabled={deviceIndex === 0} onClick={() => this.moveDeviceUp(groupId, deviceId, devices, database)}>
                                                                    <ArrowBack fontSize="inherit" />
                                                                </IconButton>
                                                                <IconButton size="small" disabled={deviceIndex === devicesInGroup.length - 1} onClick={() => this.moveDeviceDown(groupId, deviceId, devices, database)}>
                                                                    <ArrowForward fontSize="inherit" />
                                                                </IconButton>
                                                            </div>
                                                        } />
                                                    </Grid>
                                                } />
                                            </Grid>
                                        </React.Fragment>
                                    } />
                                } />
                            } />
                        </SectionCard>

                        <SectionCard>
                            <Button variant="outlined" sx= {{ width: "fit-content" }} onClick={()=>this.setState({reorder: !reorder})}>
                                {reorder ? "Done" : "Reorder"}
                            </Button>
                        </SectionCard>
                    </Grid>
                } />
            } />
        );
    }
}
