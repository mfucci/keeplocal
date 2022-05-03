/** 
 * Binds to all the records in one database.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

import { DatabaseContext } from "./DatabaseContext";
import { Database, Entry } from "../../common/database/Database";

type Props<T> = {
    dbName: string,
    children: (values: T[], update: (id: string, update: Partial<T>) => void, remove: (id: string) => void) => any,
};

type State<T> = {
    database?: Database<T>,
    values?: Entry<T>[],
};

export class Records<T> extends React.Component<Props<T>, State<T>> {
    static contextType = DatabaseContext;
    declare context: React.ContextType<typeof DatabaseContext>;
    
    async componentDidMount() {
        const { databaseManager, dbName } = {...this.props, ...this.context};
        const database = databaseManager.getDatabase<T>(dbName);
        this.setState({ database });
        database.onChange((id, value) => this.handleUpdate(id, value));
        this.setState({ values: await database.getRecords() });
    }

    componentDidUpdate({dbName: prevDbName}: Props<T>) {
        const { dbName } = this.props;
        if (prevDbName !== dbName) {
            this.componentWillUnmount();
            this.componentDidMount();
            return;
        }
    }

    private async handleUpdate(id: string, value?: Entry<T>) {
        const { values } = this.state;
        if (values === undefined) return;
        const index = values.findIndex(value => value._id === id);
        if (value === undefined) {
            // Deleted
            if (index === -1) return;
            values.splice(index, 1);
        } else {
            if (index === -1) {
                // New element
                values.push(value);
            } else {
                // Update to an existing element
                values[index] = value;
            }
        }
        this.setState({ values });
    }

    private async update(id: string, update: Partial<T>) {
        const { database, values } = this.state;
        if (database === undefined || values === undefined) return;
        const value = values.find(value => value._id === id);
        if (value === undefined) return;
        await database.updateRecord({ ...value, ...update });
    }

    private async remove(id: string) {
        const { database } = this.state;
        if (database === undefined) return;
        await database.remove(id);
    }

    componentWillUnmount() {
        const { database } = this.state;
        database?.close();
    }

    render() {
        const { values, children } = {...this.state, ...this.props};
        if (values === undefined) return null;
        return children(values, (id, update) => this.update(id, update), (id) => this.remove(id));
    }
}
