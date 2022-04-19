import React from "react";

import { DatabaseContext } from "./DatabaseContext";
import { Record as RecordConnection } from "../../database/Record";
import { Database } from "../../database/Database";

type Props<T> = {
    id: string,
    itemIdMapper: (id: string) => string,
    render: (values: T[]) => any,
};

type State<T> = {
    database?: Database,
    record?: RecordConnection<string[]>;
    itemRecords: Map<string, RecordConnection<T>>;
    values?: T[],
};

export class RecordArray<T> extends React.Component<Props<T>, State<T>> {
    static contextType = DatabaseContext;
    declare context: React.ContextType<typeof DatabaseContext>;

    constructor(props: Props<T>) {
        super(props);
        this.state = {
            itemRecords: new Map(),
        }
    }
    
    async componentDidMount() {
        const { databaseManager, id } = {...this.props, ...this.context};
        const database = await databaseManager.getDatabase();
        const record = await database.getRecord<string[]>(id);
        record.on("update", value => this.handleIndexUpdate(value));
        this.setState({ database, record: record });
        this.handleIndexUpdate(record.get());
    }

    private async handleIndexUpdate(index: string[] = []) {
        const { database, itemRecords, itemIdMapper } = { ...this.state, ...this.props };
        if (database === undefined) return;

        // Load new items
        await Promise.all(index.map(async id => {
            var itemRecord = itemRecords.get(id);
            if (itemRecord !== undefined) return;
            itemRecord = await database.getRecord(itemIdMapper(id));
            itemRecords.set(id, itemRecord);
            itemRecord?.addListener("update", () => this.handleItemUpdate());
        }));

        // Disconnect obsolete items, no need to block for this
        [...itemRecords.keys()].forEach(id => {
            if (index.indexOf(id) !== -1) return;
            const itemRecord = itemRecords.get(id);
            itemRecord?.close();
            itemRecords.delete(id);
        });

        this.handleItemUpdate();
    }

    private async handleItemUpdate() {
        const { record, itemRecords } = this.state;
        if (record === undefined) return;
        const index = record.get() ?? [];
        const values = index.map(id => itemRecords.get(id)?.get()).filter(value => value !== undefined) as T[];
        this.setState({ values });
    }

    componentWillUnmount() {
        const { record, itemRecords } = this.state;
        record?.close();
        [...itemRecords.keys()].forEach(id => itemRecords.get(id)?.close());
    }

    render() {
        const { values, render, database } = {...this.state, ...this.props};
        if (database === undefined || values === undefined) return null;
        return render(values);
    }
}
