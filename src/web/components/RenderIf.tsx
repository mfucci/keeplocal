import React from "react";

type Props = {
    condition: boolean,
    render: () => any,
};

type State = {};

export class RenderIf extends React.Component<Props, State> {
    render() {
        const { condition, render } = this.props;
        return condition ? render() : null;
    }
}
