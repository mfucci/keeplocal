
import React from "react";
import { Database } from "../../database/Database";
import { GroupItem } from "../components/GroupList";
import { DatabaseContext } from "../database/DatabaseContext";
import { Record } from "../database/Record";
import { Group } from "../models/Group";

type Props<T extends GroupItem> = {
    groupsKey: string,
    itemsKey: string,
    children: (groups: Group[], controller: GroupController<T>) => any,
};
type State = {
    database?: Database,
};

function swapItem<T>(array: T[], index1: number, index2: number) {
    const temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
}

export class GroupController<T extends GroupItem> extends React.Component<Props<T>, State> {
    static contextType = DatabaseContext;
    declare context: React.ContextType<typeof DatabaseContext>;

    async componentDidMount() {
        const { databaseManager} = this.context;
        const database = await databaseManager.getDatabase();
        this.setState({ database });
    }

    private async moveGroup(groupId: number, offset: number) {
        const { database, groupsKey } = {...this.props, ...this.state};
        if (database === undefined) return;
        
        const groups = await database.get<Group[]>(groupsKey) ?? [];
        const groupIndex = groups.findIndex(group => group.id === groupId);
        if (groupIndex === -1) return;
        swapItem(groups, groupIndex, groupIndex + offset);
        await database.set(groupsKey, groups);
    }

    async moveGroupUp(groupId: number) {
        this.moveGroup(groupId, -1);
    }

    async moveGroupDown(groupId: number) {
        this.moveGroup(groupId, +1);
    }

    private async moveGroupItem(items: T[], item: T, offset: number) {
        const { database, itemsKey } = {...this.props, ...this.state};
        if (database === undefined) return;

        const itemIndex = items.indexOf(item);
        if (itemIndex === -1) return;
        if (itemIndex + offset < 0 || itemIndex + offset >= items.length) return;

        const otherItem = items[itemIndex + offset];
        const allItems = await database.get<string[]>(itemsKey) ?? [];
        swapItem(allItems, allItems.indexOf(item.id), allItems.indexOf(otherItem.id));
        await database.set(itemsKey, items.map(item => item.id));
    }

    async moveGroupItemLeft(items: T[], item: T) {
        this.moveGroupItem(items, item, -1);
    }

    async moveGroupItemRight(items: T[], item: T) {
        this.moveGroupItem(items, item, +1);
    }

    render() {
        const { children, groupsKey } = this.props;
        return (
            <Record<Group[]> id={groupsKey}>
                {groups => children(groups, this)}
            </Record>
        );
    }
}