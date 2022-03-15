import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import React, { FunctionComponent } from "react";

import { useParams } from "react-router-dom";

import Router from '@mui/icons-material/DeviceHub';
import RouterWifi from '@mui/icons-material/Router';
import Phone from '@mui/icons-material/PhoneAndroid';
import Laptop from '@mui/icons-material/Laptop';
import Desktop from '@mui/icons-material/DesktopWindows';
import Tablet from '@mui/icons-material/TabletAndroid';
import Tv from '@mui/icons-material/Tv';
import Hub from '@mui/icons-material/Hub';
import Camera from '@mui/icons-material/VideoCameraFront';
import Speaker from '@mui/icons-material/Speaker';
import Unknown from '@mui/icons-material/DeviceUnknown';

export enum ICONS {
    ROUTER,
    ROUTER_WIFI,
    PHONE,
    LAPTOP,
    WORKSTATION,
    TABLET,
    TV,
    HUB,
    CAMERA,
    SMART_SPEAKER,
    UNKNWON,
}

export enum OS {
    ANDROID,
    IOS,
    UBUNTU,
}

export enum VENDOR {
    GOOGLE,
    APPLE,
    RING,
}

export const ICONS_MAP = new Map<ICONS, FunctionComponent<any>>();
ICONS_MAP.set(ICONS.ROUTER, Router);
ICONS_MAP.set(ICONS.ROUTER_WIFI, RouterWifi);
ICONS_MAP.set(ICONS.PHONE, Phone);
ICONS_MAP.set(ICONS.LAPTOP, Laptop);
ICONS_MAP.set(ICONS.WORKSTATION, Desktop);
ICONS_MAP.set(ICONS.TABLET, Tablet);
ICONS_MAP.set(ICONS.TV, Tv);
ICONS_MAP.set(ICONS.HUB, Hub);
ICONS_MAP.set(ICONS.CAMERA, Camera);
ICONS_MAP.set(ICONS.SMART_SPEAKER, Speaker);
ICONS_MAP.set(ICONS.UNKNWON, Unknown);

type Props = {
    id: string,
};
type State = {
    device: { name: string, icon?: ICONS, os?: OS, vendor?: VENDOR, online?: boolean, ip?: string, mac?: string, vendorFromMac?: string, model?: string}
};

const GroupLabel = ({label}: {label: string}) => <Typography sx={{ mt: 0.5, ml: 2, mb: 1 }} color="text.secondary" display="block" variant="subtitle1">{label}</Typography>;

export class DeviceView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            device: {
                name: "Workstation",
                icon: ICONS.WORKSTATION,
                os: OS.UBUNTU,
                online: true,
                ip: "192.168.200.4",
                mac: "04:a1:51:1b:12:92",
                vendorFromMac: "NETGEAR",
                vendor: undefined,
                model: "SRT-2375",
            },
        };
    }

    render() {
        const { id, device } = { ...this.props, ...this.state };
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        Bla bla device {id}
                    </Paper>
                </Grid>
            </Grid>
        );
    }
}

export const DeviceViewRouter = () => {
    const { id } = useParams();
    if (id === undefined) throw new Error("Missing device id");
    return <DeviceView id={id} />
}
