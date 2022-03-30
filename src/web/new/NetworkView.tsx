import React from "react";
import { Divider, Grid, IconButton, Paper, Typography } from "@mui/material";

import Unknown from '@mui/icons-material/DeviceUnknown';
import { Link } from "react-router-dom";
import { ICONS, ICONS_MAP, OS } from "./DeviceView";

type Props = {};
type State = {
    groups: {name: string, devices: string[]}[],
    devices: {[id: string]: {name: string, icon?: ICONS, os?: OS, vendor?: string, online?: boolean}},
};

const GroupLabel = ({label}: {label: string}) => <Typography sx={{ mt: 0.5, ml: 2, mb: 1 }} color="text.secondary" display="block" variant="subtitle1">{label}</Typography>;

export class Network extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            groups: [
                {name: "Network", devices: ["1", "2", "3", "4", "5"]},
                {name: "Marco's devices", devices: ["6", "7", "8"]},
                {name: "Catherine's devices", devices: ["9", "10", "11"]},
                {name: "Smart Home", devices: ["12", "13", "14"]},
                {name: "Security", devices: ["15", "16"]},
            ],
            devices: {
                "1": {name: "Gateway", icon: ICONS.ROUTER, online: true},
                "2": {name: "Kitchen", icon: ICONS.ROUTER_WIFI, online: true},
                "3": {name: "Downstairs", icon: ICONS.ROUTER_WIFI, online: true},
                "4": {name: "Ohana", icon: ICONS.ROUTER_WIFI, online: true},
                "5": {name: "SafeGate", icon: ICONS.ROUTER, online: true},
                "6": {name: "Pixel", icon: ICONS.PHONE, os: OS.ANDROID, online: true},
                "7": {name: "HP", icon: ICONS.LAPTOP, os: OS.UBUNTU, online: false},
                "8": {name: "Workstation", icon: ICONS.WORKSTATION, os: OS.UBUNTU, online: true},
                "9": {name: "iPhone", icon: ICONS.PHONE, vendor: "Apple", online: true},
                "10": {name: "MacBook", icon: ICONS.LAPTOP, vendor: "Apple", online: false},
                "11": {name: "iPad", icon: ICONS.TABLET, vendor: "Apple", online: true},
                "12": {name: "TV Room", icon: ICONS.TV, os: OS.ANDROID, online: true},
                "13": {name: "Ohana", icon: ICONS.TV, os: OS.ANDROID, online: true},
                "14": {name: "Kitchen", icon: ICONS.SMART_SPEAKER, vendor: "Google", online: true},
                "15": {name: "BaseStation", icon: ICONS.HUB, vendor: "Ring", online: true},
                "16": {name: "Gate", icon: ICONS.CAMERA, vendor: "Ring", online: true},
                "17": {name: "56:12:34:13:12", online: true},
            },
        };
    }

    render() {
        const { groups, devices } = this.state;
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        {Object.keys(devices).length} devices, {Object.keys(devices).filter(id => devices[id].online === undefined ? false : devices[id].online).length} online
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        {groups.map(({name, devices: groupDevices}, index) =>
                            <React.Fragment key={name}>
                                {index === 0 || <Divider />}
                                <GroupLabel label={name} />
                                <Grid container spacing={3} sx={{ mb: 1 }} columns={{ xs: 2, sm: 4, md: 8, lg: 10 }}>
                                    {groupDevices.map(id => {
                                        const {name, icon = ICONS.UNKNWON} = devices[id];
                                        return (
                                            <Grid item xs={1} key={id} sx={{ width: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                <IconButton color="warning" sx={{ width: 60, height: 60 }} component={Link} to={`/device/${id}`}>
                                                    {React.createElement(ICONS_MAP.get(icon) ?? Unknown, { sx: { width: 40, height: 40 } })}
                                                </IconButton>
                                                {name}
                                            </Grid>
                                        )})}
                                </Grid>
                            </React.Fragment>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        );
    }
}
