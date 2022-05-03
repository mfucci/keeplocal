 import React from "react";
 
 type Props = {
     onMount?: () => void,
     onUmount?: () => void,
     children: any,
 };
 type State = {};
 
 export class Lifecycle extends React.Component<Props, State> {

    componentDidMount() {
        this.props.onMount?.();
    }

    componentWillUnmount() {
        this.props.onUmount?.();
    }
 
    render() {
        const { children } = this.props;
        return children;
    }
 }
 