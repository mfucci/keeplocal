/**
 * Binds to a Database record.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Database, Entry } from "../../common/database/Database";

import { DatabaseContext } from "./DatabaseContext";

type Props<T> = {
  dbName: string;
  id?: string;
  children: (
    value: T,
    update: (update: Partial<T>) => void,
    remove: () => void
  ) => any;
};

type State<T> = {
  database?: Database<T>;
  value?: Entry<T>;
};

export class Record<T> extends React.Component<Props<T>, State<T>> {
  static contextType = DatabaseContext;
  declare context: React.ContextType<typeof DatabaseContext>;

  constructor(props: Props<T>) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { databaseManager, dbName, id } = { ...this.props, ...this.context };
    if (id === undefined) return;
    const database = databaseManager.getDatabase<T>(dbName);
    database.onRecordChange(id, (value) => this.handleValueUpdate(value));
    this.setState({ database });
  }

  componentDidUpdate({ dbName: prevDbName, id: prevId }: Props<T>) {
    const { dbName, id } = this.props;
    if (prevDbName !== dbName || prevId !== id) {
      this.componentWillUnmount();
      this.componentDidMount();
      return;
    }
  }

  private handleValueUpdate(value?: Entry<T>) {
    this.setState({ value });
  }

  private async update(update: Partial<T>) {
    const { database, value } = this.state;
    if (database === undefined || value === undefined) return;
    await database.updateRecord({ ...value, ...update });
  }

  private async remove() {
    const { database, id } = { ...this.state, ...this.props };
    if (database === undefined || id === undefined) return;
    await database.remove(id);
  }

  componentWillUnmount() {
    const { database } = this.state;
    database?.close();
  }

  render() {
    const { value, children, database } = { ...this.state, ...this.props };
    if (database === undefined || value === undefined) return null;
    return children(
      value,
      (update) => this.update(update),
      () => this.remove()
    );
  }
}
