import { FunctionComponent } from "react";

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

import { DEVICE_CATEGORIES } from "../models/DeviceCategories";

export const DEVICE_CATEGORY_ICONS: {[permission in DEVICE_CATEGORIES]: FunctionComponent<any>} = {
    [DEVICE_CATEGORIES.ROUTER]: Router,
    [DEVICE_CATEGORIES.ROUTER_WIFI]: RouterWifi,
    [DEVICE_CATEGORIES.PHONE]: Phone,
    [DEVICE_CATEGORIES.LAPTOP]: Laptop,
    [DEVICE_CATEGORIES.WORKSTATION]: Desktop,
    [DEVICE_CATEGORIES.TABLET]: Tablet,
    [DEVICE_CATEGORIES.TV]: Tv,
    [DEVICE_CATEGORIES.HUB]: Hub,
    [DEVICE_CATEGORIES.CAMERA]: Camera,
    [DEVICE_CATEGORIES.SMART_SPEAKER]: Speaker,
    [DEVICE_CATEGORIES.UNKNOWN]: Unknown,
};
