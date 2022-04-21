/** 
 * Display time relative to current time.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

import { format } from "timeago.js";
 
type Props = {
    time?: number,
};

type State = {
    currentTime: number,
};

export class TimeAgo extends React.Component<Props, State> {
    private interval?: any;
 
    constructor(props: Props) {
        super(props);
        this.state = {
            currentTime: new Date().getTime(),
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.setState({currentTime: new Date().getTime()}), 10 * 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render = () => this.props.time ? format(this.props.time) : "";
}
 