/** 
 * Controller to modify groups.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DatabaseContext } from "../database/DatabaseContext";
import { Group, GroupItem, UNASSIGNED_GROUP_ID } from "../../common/models/Group";
import { sortByOrder } from "../../common/models/Ordered";

type Props<T extends GroupItem> = {
    groupsDb: string,
    itemsDb: string,
    children: (controller: GroupController<T>) => any,
};
type State = {};

export class GroupController<T extends GroupItem> extends React.Component<Props<T>, State> {
    static contextType = DatabaseContext;
    declare context: React.ContextType<typeof DatabaseContext>;

    async removeGroup(id: string) {
        const { databaseManager, groupsDb, itemsDb } = { ...this.context, ...this.state, ...this.props };

        await databaseManager.withDatabase<T>(itemsDb, async database => {
            const items = await database.getRecords();
            const unassignedItems = items.filter(item => item.groupId === UNASSIGNED_GROUP_ID).sort(sortByOrder);

            items.filter(item => item.groupId === id)
                .sort(sortByOrder)
                .forEach(item => {
                    item.groupId = UNASSIGNED_GROUP_ID;
                    unassignedItems.push(item);
                });

            let order = 0;
            unassignedItems.forEach(item => item.order = order++);

            await database.updateRecords(unassignedItems);
        });

        await databaseManager.withDatabase<Group>(groupsDb, database => database.remove(id));
    }

    async addGroup(name: string): Promise<string> {
        const { databaseManager, groupsDb } = { ...this.context, ...this.state, ...this.props };

        const groupId = name + new Date().getTime();
        await databaseManager.withDatabase<Group>(groupsDb, async database => {
            let order = 0;
            const groups = (await database.getRecords()).sort(sortByOrder);
            groups.forEach(group => group.order = order++);
            await database.updateRecords(groups);
            await database.addRecord({ _id: groupId, name, order });
        });
        return groupId;
    }

    async moveItemToGroup(groupId: string, itemId: string) {
        const { databaseManager, itemsDb } = { ...this.context, ...this.state, ...this.props };

        await databaseManager.withDatabase<T>(itemsDb, async database => {
            const item = await database.getRecord(itemId);
            const items = (await database.getRecords()).filter(item => item.groupId === groupId).sort(sortByOrder);
            let order = 0;
            items.forEach(item => item.order = order++);
            item.order = order;
            item.groupId = groupId;
            items.push(item);
            await database.updateRecords(items);
        });
    }

    render() {
        const { children } = this.props;
        return children(this);
    }
}
