/** 
 * Page to view / edit the local network.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactChild } from "react";
import { Button, Divider, Grid, IconButton, Paper, Typography } from "@mui/material";

import { Link } from "react-router-dom";
import { DeviceCategoryIcon } from "../components/DeviceCategoryUi";
import { Device } from "../models/Device";
import { DeviceGroup } from "../models/DeviceGroup";
import { Record } from "../database/Record";
import { RecordArray } from "../database/RecordArray";
import { Iterate } from "../react/Iterate";
import { With } from "../react/With";
import { If } from "../react/If";
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
                            <Iterate array={groups}>{({id: groupId, name}, groupIndex) =>
                                <With key={groupId} value={devices.filter(device => device.groupId === groupId)}>{devicesInGroup =>
                                    <If condition={devicesInGroup.length > 0}>
                                        <If condition={groupIndex > 0}>
                                            <Divider />
                                        </If>
                                        
                                        <Typography sx={{ mt: 0.5, ml: 2, mb: 1 }} color="text.secondary" display="block" variant="subtitle1">
                                            {name}
                                            <If condition={reorder}>
                                                <IconButton size="small" disabled={groupIndex === 0} onClick={() => this.moveCategoryUp(groupId, groups, database)}>
                                                    <ArrowUpward fontSize="inherit" />
                                                </IconButton>
                                                <IconButton size="small" disabled={groupIndex === groups.length - 1} onClick={() => this.moveCategoryDown(groupId, groups, database)}>
                                                    <ArrowDownward fontSize="inherit" />
                                                </IconButton>
                                            </If>
                                        </Typography>

                                        <Grid container spacing={3} sx={{ mb: 1 }} columns={{ xs: 2, sm: 4, md: 8, lg: 10 }}>
                                            <Iterate array={devicesInGroup}>{({mac: deviceId, name, category }, deviceIndex) => 
                                                <Grid key={deviceId} item xs={1} sx={{ width: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <IconButton color="warning" sx={{ width: 60, height: 60 }} component={Link} to={`/device/${deviceId}`}>
                                                        <DeviceCategoryIcon category={category} sx={{ width: 40, height: 40 }} />
                                                    </IconButton>
                                                    {name}
                                                    <If condition={reorder}>
                                                        <div>
                                                            <IconButton size="small" disabled={deviceIndex === 0} onClick={() => this.moveDeviceUp(groupId, deviceId, devices, database)}>
                                                                <ArrowBack fontSize="inherit" />
                                                            </IconButton>
                                                            <IconButton size="small" disabled={deviceIndex === devicesInGroup.length - 1} onClick={() => this.moveDeviceDown(groupId, deviceId, devices, database)}>
                                                                <ArrowForward fontSize="inherit" />
                                                            </IconButton>
                                                        </div>
                                                    </If>
                                                </Grid>
                                            }</Iterate>
                                        </Grid>
                                    </If>
                                }</With>
                            }</Iterate>
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
