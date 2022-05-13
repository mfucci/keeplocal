/** 
 * Allows to attach hooks to the component lifecycle.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
 
type Props = {
    onMount?: () => void,
    onUnmount?: () => void,
    children: any,
};
type State = {};
 
export class Lifecycle extends React.Component<Props, State> {

    componentDidMount() {
        this.props.onMount?.();
    }

    componentWillUnmount() {
        this.props.onUnmount?.();
    }
 
    render() {
        const { children } = this.props;
        return children;
    }
}
