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
import { DEVICE_CATEGORIES } from "../../common/models/Device";

const ICONS: {[permission in DEVICE_CATEGORIES]: FunctionComponent<any>} = {
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

// Note: this array defines the display order
export const DEVICE_CATEGORIES_LABELS: {[permission in DEVICE_CATEGORIES]: string} = {
    [DEVICE_CATEGORIES.ROUTER]: "Router",
    [DEVICE_CATEGORIES.ROUTER_WIFI]: "WiFi router",
    [DEVICE_CATEGORIES.PHONE]: "Phone",
    [DEVICE_CATEGORIES.LAPTOP]: "Laptop",
    [DEVICE_CATEGORIES.WORKSTATION]: "Desktop",
    [DEVICE_CATEGORIES.TABLET]: "Tablet",
    [DEVICE_CATEGORIES.TV]: "Tv",
    [DEVICE_CATEGORIES.HUB]: "Hub",
    [DEVICE_CATEGORIES.CAMERA]: "Camera",
    [DEVICE_CATEGORIES.SMART_SPEAKER]: "Speaker",
    [DEVICE_CATEGORIES.UNKNOWN]: "Unknown",
};

export function DeviceCategoryIcon({category = DEVICE_CATEGORIES.UNKNOWN, sx}: {category?: DEVICE_CATEGORIES, sx: SxProps<any>}) {
    return React.createElement(ICONS[category], { sx });
};
