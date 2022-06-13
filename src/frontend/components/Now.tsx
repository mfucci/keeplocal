/** 
 * Gives access to the auto-refreshing current time.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

const REFRESH_MS = 10 * 1000; // 10s
 
type Props = {
    children: (now: number) => any,
};

type State = {
    now: number,
};

export class Now extends React.Component<Props, State> {
    private interval?: any;
 
    constructor(props: Props) {
        super(props);
        this.state = {
            now: Date.now(),
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.setState({now: Date.now()}), REFRESH_MS);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const { now, children } = { ...this.state, ...this.props };
        return children(now);
    }
}
