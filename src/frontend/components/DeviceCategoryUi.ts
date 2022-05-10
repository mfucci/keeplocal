/**
 * Icons and labels of device categories.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FunctionComponent } from "react";

import { SxProps } from "@mui/material";
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
import { DeviceCategory } from "../../common/models/Device";

const ICONS: {[permission in DeviceCategory]: FunctionComponent<any>} = {
    [DeviceCategory.ROUTER]: Router,
    [DeviceCategory.ROUTER_WIFI]: RouterWifi,
    [DeviceCategory.PHONE]: Phone,
    [DeviceCategory.LAPTOP]: Laptop,
    [DeviceCategory.WORKSTATION]: Desktop,
    [DeviceCategory.TABLET]: Tablet,
    [DeviceCategory.TV]: Tv,
    [DeviceCategory.HUB]: Hub,
    [DeviceCategory.CAMERA]: Camera,
    [DeviceCategory.SMART_SPEAKER]: Speaker,
    [DeviceCategory.UNKNOWN]: Unknown,
};

// Note: this array defines the display order
export const DEVICE_CATEGORIES_LABELS: {[permission in DeviceCategory]: string} = {
    [DeviceCategory.ROUTER]: "Router",
    [DeviceCategory.ROUTER_WIFI]: "WiFi router",
    [DeviceCategory.PHONE]: "Phone",
    [DeviceCategory.LAPTOP]: "Laptop",
    [DeviceCategory.WORKSTATION]: "Desktop",
    [DeviceCategory.TABLET]: "Tablet",
    [DeviceCategory.TV]: "Tv",
    [DeviceCategory.HUB]: "Hub",
    [DeviceCategory.CAMERA]: "Camera",
    [DeviceCategory.SMART_SPEAKER]: "Speaker",
    [DeviceCategory.UNKNOWN]: "Unknown",
};

export function DeviceCategoryIcon({category = DeviceCategory.UNKNOWN, sx}: {category?: DeviceCategory, sx: SxProps<any>}) {
    return React.createElement(ICONS[category], { sx });
};
