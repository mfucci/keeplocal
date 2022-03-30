
import React, { FunctionComponent } from "react";
import { useParams } from "react-router-dom";

import { Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, FormGroup, Grid, Icon, Paper, Switch, Typography } from "@mui/material";
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
import DeleteIcon from '@mui/icons-material/Delete';

import { EditableLabel } from "./EditableLabel";

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
    device: { name: string, icon?: ICONS, os?: OS, vendor?: string, online?: boolean, ip?: string, mac?: string, vendorFromMac?: string, model?: string},
    confirmDelete: boolean,
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
            confirmDelete: false,
        };
    }

    render() {
        const { id, device, confirmDelete } = { ...this.props, ...this.state };
        const { name, icon = ICONS.UNKNWON, vendor, model, mac, ip, online } = device;
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Icon color="warning" sx={{ width: 60, height: 60 }}>
                                {React.createElement(ICONS_MAP.get(icon) ?? Unknown, { sx: { width: 40, height: 40 } })}
                            </Icon>
                            <Typography gutterBottom variant="h4" component="div"><EditableLabel initialValue={name} onChange={name => this.setState({device: {...device, name}})} /></Typography>
                            <div>Vendor: <EditableLabel initialValue={vendor} onChange={vendor => this.setState({device: {...device, vendor}})} /></div>
                            <div>Model: <EditableLabel initialValue={model} onChange={model => this.setState({device: {...device, model}})} /></div>
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
                                    <Button onClick={()=>this.setState({confirmDelete: false})}>Yes</Button>
                                    <Button onClick={()=>this.setState({confirmDelete: false})} autoFocus>No</Button>
                                </DialogActions>
                            </Dialog>
                        </CardActions>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div" color="primary">Network</Typography>
                            <div>MAC address: {mac}</div>
                            <div>IP address: {ip}</div>
                            <div>Status: {online ? "online" : "offline"}</div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div" color="primary">Permissions</Typography>
                            <FormGroup>
                                <FormControlLabel control={<Switch defaultChecked />} label="Cloud access" />
                                <FormControlLabel control={<Switch />} label="Local network" />
                            </FormGroup>
                        </CardContent>
                    </Card>
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
