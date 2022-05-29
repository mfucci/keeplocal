/**
 * Controller to update the order of elements.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DatabaseContext } from "../database/DatabaseContext";
import { Ordered, sortByOrder } from "../../common/models/Ordered";

type Props<T extends Ordered> = {
  dbName: string;
  filter?: (record: T) => boolean;
  children: (controller: OrderController<T>) => any;
};
type State = {};

export class OrderController<T extends Ordered> extends React.Component<
  Props<T>,
  State
> {
  static contextType = DatabaseContext;
  declare context: React.ContextType<typeof DatabaseContext>;

  private async move(id: string, offset: number) {
    const { databaseManager, dbName, filter } = {
      ...this.props,
      ...this.context,
    };
    await databaseManager.withDatabase<T>(dbName, async (database) => {
      var records = await database.getRecords();
      if (filter !== undefined) {
        records = records.filter((record) => filter(record));
      }
      records.sort(sortByOrder);
      const index = records.findIndex((record) => record._id === id);
      if (
        index === -1 ||
        index + offset < 0 ||
        index + offset >= records.length
      )
        return;

      // Swap order value between the two groups
      const item = records[index];
      const itemToSwap = records[index + offset];

      if (itemToSwap.order == item.order) {
        // We need to reassign all order index
        var order = 0;
        records.forEach((record) => (record.order = order++));
        await database.updateRecords(records);
      }

      const tempOrder = itemToSwap.order;
      itemToSwap.order = item.order;
      item.order = tempOrder;

      await database.updateRecords([item, itemToSwap]);
    });
  }

  async moveUp(id: string) {
    this.move(id, -1);
  }

  async moveDown(id: string) {
    this.move(id, +1);
  }

  render() {
    const { children } = this.props;
    return children(this);
  }
}
