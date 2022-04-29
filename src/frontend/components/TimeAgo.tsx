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
    now: number,
    timestamp: number,
};

type State = {};

export class TimeAgo extends React.Component<Props, State> {
    render = () => this.props.timestamp ? format(this.props.timestamp) : "";
}
 