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
    ids: string[],
    render: (values: T[]) => any,
};

type State<T> = {
    connections?: RecordConnection<T>[];
    values?: T[],
};

export class Records<T> extends React.Component<Props<T>, State<T>> {
    static contextType = DatabaseContext;
    declare context: React.ContextType<typeof DatabaseContext>;

    constructor(props: Props<T>) {
        super(props);
        this.state = {};
    }

    async componentDidMount() {
        const { databaseManager, ids } = {...this.props, ...this.context};
        const database = await databaseManager.getDatabase();
        const connections = await Promise.all(ids.map(id => database.getRecord<T>(id)));
        connections.forEach(connection => connection.on("update", () => this.handleValueUpdate(connections)));
        this.handleValueUpdate(connections);
        this.setState({ connections });
    }

    private handleValueUpdate(connections: RecordConnection<T>[]) {
        const values = connections.map(connection => connection.get()).filter(value => value !== undefined) as T[];
        this.setState({ values });
    }

    componentWillUnmount() {
        const { connections } = this.state;
        connections?.forEach(connection => connection.close());
    }

    render() {
        const { values, render } = {...this.state, ...this.props};
        if (values === undefined) return null;
        return render(values);
    }
}
