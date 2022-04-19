
import React from "react";

type Props<T> = {
    array: T[],
    render: (value: T, index: number) => any,
};

type State = {};

export class ArrayMap<T> extends React.Component<Props<T>, State> {
    render() {
        const { array, render } = this.props;
        return array.map((value, index) => render(value, index));
    }
}
