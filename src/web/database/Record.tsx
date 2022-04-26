/** 
 * Binds to a Database record.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Database } from "../../database/Database";
import { Record as RecordConnection } from "../../database/Record";

import { DatabaseContext } from "./DatabaseContext";

type Props<T> = {
    id: string,
    children: (value: T, updater: (update: Partial<T>) => void, database: Database) => any,
};

type State<T> = {
    database?: Database,
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
        const database = await databaseManager.getDatabase();
        const connection = await database.getRecord<T>(id);
        connection.on("update", value => this.handleValueUpdate(value));
        this.handleValueUpdate(connection.get());
        this.setState({ database, connection });
    }

    private handleValueUpdate(value?: T) {
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
        const { value, children, database } = {...this.state, ...this.props};
        if (database === undefined || value === undefined) return null;
        return children(value, update => this.updateValue(update), database);
    }
}
