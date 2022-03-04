/** 
 * Binds to a Database record.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Record as RecordConnection } from "../../database/Record";

import { DatabaseContext } from "./DatabaseContext";

type Props<T> = {
    id: string,
    onValue?: (value: T | undefined) => any,
    render?: (value: T, updater: (update: Partial<T>) => void) => any,
};

type State<T> = {
    connection?: RecordConnection<T>;
    value?: T,
};

export class Record<T> extends React.Component<Props<T>, State<T>> {
    static contextType = DatabaseContext;
    declare context: React.ContextType<typeof DatabaseContext>;

    constructor(props: Props<T>) {
        super(props);
        this.state = {};
    }

    async componentDidMount() {
        const { databaseManager, id } = {...this.props, ...this.context};
        const connection = await (await databaseManager.getDatabase()).getRecord<T>(id);
        connection.on("update", value => this.handleValueUpdate(value));
        this.handleValueUpdate(connection.get());
        this.setState({ connection });
    }

    private handleValueUpdate(value?: T) {
        const { onValue } = this.props;
        onValue?.(value);
        this.setState({ value });
    }

    private updateValue(update: Partial<T>) {
        const { connection, value } = this.state;
        if (connection === undefined || value === undefined) return;
        connection.set({ ...value, ...update });
    }

    componentWillUnmount() {
        const { connection } = this.state;
        connection?.close();
    }

    render() {
        const { value, render } = {...this.state, ...this.props};
        if (value === undefined || render === undefined) return null;
        return render(value, update => this.updateValue(update));
    }
}
