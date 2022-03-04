/** 
 * Main page of the UI.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import ReactDom from "react-dom";

import { DeviceList } from "./deviceList/DeviceList";

import "./index.html";
import "./index.css";
import "./icons/favicon.svg";

type Props = {};
type State = {};

class Index extends React.Component<Props, State> {
    render() {
        return <DeviceList/>
    }
}

ReactDom.render(
    <Index />,
    document.getElementById("root"),
);
