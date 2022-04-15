
import React, { FunctionComponent } from "react";
import { useParams } from "react-router-dom";

import { Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormGroup, Grid, Icon, InputLabel, MenuItem, Paper, Select, Switch, Typography } from "@mui/material";
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

import { EditableLabel } from "../components/EditableLabel";

export const enum CATEGORIES {
    ROUTER = "router",
    ROUTER_WIFI = "router_wifi",
    PHONE = "phone",
    LAPTOP = "laptop",
    WORKSTATION = "workstation",
    TABLET = "tablet",
    TV = "tv",
    HUB = "hub",
    CAMERA = "camera",
    SMART_SPEAKER = "smart_speaker",
    UNKNWON = "unknown",
}

export const enum PERMISSIONS {
    INTERNET = "internet",
    LOCAL_NETWORK = "local_network",
}

export const CATEGORY_ICONS: {[permission in CATEGORIES]: FunctionComponent<any>} = {
    [CATEGORIES.ROUTER]: Router,
    [CATEGORIES.ROUTER_WIFI]: RouterWifi,
    [CATEGORIES.PHONE]: Phone,
    [CATEGORIES.LAPTOP]: Laptop,
    [CATEGORIES.WORKSTATION]: Desktop,
    [CATEGORIES.TABLET]: Tablet,
    [CATEGORIES.TV]: Tv,
    [CATEGORIES.HUB]: Hub,
    [CATEGORIES.CAMERA]: Camera,
    [CATEGORIES.SMART_SPEAKER]: Speaker,
    [CATEGORIES.UNKNWON]: Unknown,
};

export const CATEGORY_LABELS: {[permission in CATEGORIES]: string} = {
    [CATEGORIES.ROUTER]: "Router",
    [CATEGORIES.ROUTER_WIFI]: "WiFi router",
    [CATEGORIES.PHONE]: "Phone",
    [CATEGORIES.LAPTOP]: "Laptop",
    [CATEGORIES.WORKSTATION]: "Desktop",
    [CATEGORIES.TABLET]: "Tablet",
    [CATEGORIES.TV]: "Tv",
    [CATEGORIES.HUB]: "Hub",
    [CATEGORIES.CAMERA]: "Camera",
    [CATEGORIES.SMART_SPEAKER]: "Speaker",
    [CATEGORIES.UNKNWON]: "Unknown",
};

export const PERMISSION_LABELS: {[permission in PERMISSIONS]: string} = {
    [PERMISSIONS.INTERNET]: "Internet",
    [PERMISSIONS.LOCAL_NETWORK]: "Local network",
};

export type Device = {
    name: string,
    category?: CATEGORIES,
    vendor?: string,
    online?: boolean,
    ip?: string,
    mac?: string,
    vendorFromMac?: string,
    model?: string,
    hostname?: string,
    permissions: {
        [permission in PERMISSIONS]?: boolean;
    }
};

type Props = {
    id: string,
};
type State = {
    device: Device,
    confirmDelete: boolean,
};

const GroupLabel = ({label}: {label: string}) => <Typography sx={{ mt: 0.5, ml: 2, mb: 1 }} color="text.secondary" display="block" variant="subtitle1">{label}</Typography>;

export class DeviceView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            device: {
                name: "Workstation",
                category: CATEGORIES.WORKSTATION,
                online: true,
                ip: "192.168.200.4",
                mac: "04:a1:51:1b:12:92",
                vendorFromMac: "NETGEAR",
                vendor: undefined,
                model: "SRT-2375",
                hostname: "workstation.local",
                permissions: {
                    [PERMISSIONS.INTERNET]: true,
                    [PERMISSIONS.LOCAL_NETWORK]: false,
                }
            },
            confirmDelete: false,
        };
    }

    render() {
        const { device, confirmDelete } = { ...this.props, ...this.state };
        const { name, category = CATEGORIES.UNKNWON, vendor, model, mac, ip, online, hostname, permissions } = device;
        return (
            <Grid container spacing={3} columns={{ xs: 6, md: 12 }}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Icon color="warning" sx={{ width: 60, height: 60 }}>
                                {React.createElement(CATEGORY_ICONS[category], { sx: { width: 40, height: 40 } })}
                            </Icon>
                            <Typography gutterBottom variant="h4" component="div"><EditableLabel initialValue={name} onChange={name => this.setState({device: {...device, name}})} /></Typography>
                            <div style={{lineHeight: "34px"}}>Vendor: <EditableLabel initialValue={vendor} onChange={vendor => this.setState({device: {...device, vendor}})} /></div>
                            <div style={{lineHeight: "34px"}}>Model: <EditableLabel initialValue={model} onChange={model => this.setState({device: {...device, model}})} /></div>
                            <div style={{lineHeight: "34px"}}>Category: <FormControl variant="standard">
                                    <Select value={category} label="Category" onChange={({target: {value}}) => this.setState({device: {...device, category: value as CATEGORIES}})}>
                                        {(Object.entries(CATEGORY_LABELS) as [CATEGORIES, string][]).map(([category, label]) =>
                                            <MenuItem key={category} value={category}>{label}</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
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
                                    <Button onClick={()=>this.setState({confirmDelete: false})}>Yes</Button>
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
                                {(Object.entries(permissions) as [PERMISSIONS, boolean][]).map(([permission, state]) =>
                                    <FormControlLabel key={permission} control={<Switch defaultChecked={state} />} label={PERMISSION_LABELS[permission]} onChange={(event, checked) => {permissions[permission] = checked}}/>
                                )}
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
        );
    }
}

export const DeviceViewRouter = () => {
    const { id } = useParams();
    if (id === undefined) throw new Error("Missing device id");
    return <DeviceView id={id} />
}
