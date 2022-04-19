import React from "react";

type Props<T> = {
    value: T,
    render: (value: T) => any,
};

type State = {};

export class With<T> extends React.Component<Props<T>, State> {
    render() {
        const { value, render } = this.props;
        return render(value);
    }
}
