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
import { Entry, NewEntry } from "../../common/database/Database";

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

        await databaseManager.updateRecords<T>(itemsDb, items => {
            const unassignedItems = items.filter(item => item.groupId === UNASSIGNED_GROUP_ID).sort(sortByOrder);

            items.filter(item => item.groupId === id)
                .sort(sortByOrder)
                .forEach(item => {
                    item.groupId = UNASSIGNED_GROUP_ID;
                    unassignedItems.push(item);
                });
    
            var order = 0;
            unassignedItems.forEach(item => item.order = order++);
    
            return unassignedItems;
        });

        await databaseManager.withDatabase<Group>(groupsDb, database => database.remove(id));
    }

    async addGroup(name: string): Promise<string> {
        const { databaseManager, groupsDb } = { ...this.context, ...this.state, ...this.props };
       
        const groupId = name + new Date().getTime();
        await databaseManager.updateRecords<Group>(groupsDb, groups => {
            const updatedGroups: (Entry<Group> | NewEntry<Group>)[] = groups.sort(sortByOrder);
            var order = 0;
            updatedGroups.forEach(group => group.order = order++);
            updatedGroups.push({ _id: groupId, name, order });
            return updatedGroups;
        });
        return groupId;
    }

    async moveItemToGroup(groupId: string, itemId: string) {
        const { databaseManager, itemsDb } = { ...this.context, ...this.state, ...this.props };

        await databaseManager.withDatabase<T>(itemsDb, async database => {
            const item = await database.getRecord(itemId);
            await database.updateRecords(items => {
                const itemsInGroup = items.filter(item => item.groupId === groupId).sort(sortByOrder);
                var order = 0;
                itemsInGroup.forEach(item => item.order = order++);
                item.order = order;
                item.groupId = groupId;
                itemsInGroup.push(item);
                return items;
            });
        });
    }

    render() {
        const { children } = this.props;
        return children(this);
    }
}
