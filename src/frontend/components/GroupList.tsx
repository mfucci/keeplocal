import React from "react";

import { Divider, Grid, IconButton, Typography } from "@mui/material";

import { If } from "../react/If";
import { Iterate } from "../react/Iterate";
import { Group, GroupItem } from "../../common/models/Group";
import { ArrowBack, ArrowDownward, ArrowForward, ArrowUpward } from "@mui/icons-material";
import { OrderController } from "../controllers/OrderController";
import { Records } from "../database/Records";
import { sortByOrder } from "../../common/models/Ordered";

type Props<T extends GroupItem> = {
    groupsDb: string,
    itemsDb: string,
    iconRender: (item: T) => any,
    onClick: (item: T) => void,
    editOrder?: boolean,
}

export const GroupList = <T extends GroupItem>({iconRender, onClick, groupsDb, itemsDb, editOrder = false}: Props<T>) => (
    <Records<Group> dbName={groupsDb}>{groups =>
        <Records<T> dbName={itemsDb}>{allItems =>
            <Iterate array={groups.sort(sortByOrder).map(group => ({group, items: allItems.filter(item => item.groupId === group._id).sort(sortByOrder)})).filter(({items}) => items.length > 0)}>{({group: {name, _id}, items}, index) =>
                <React.Fragment key={_id}>
                    <If condition={index > 0}><Divider /></If>
                    <Typography sx={{ mt: 0.5, ml: 2, mb: 1 }} color="text.secondary" display="block" variant="subtitle1">
                        {name}
                        <If condition={editOrder}>
                            <OrderController<Group> dbName={groupsDb}>{controller =>
                                <React.Fragment>
                                    <IconButton size="small" disabled={index === 0} onClick={() => controller.moveUp(_id)}><ArrowUpward fontSize="inherit" /></IconButton>
                                    <IconButton size="small" disabled={index === items.length - 1} onClick={() => controller.moveDown(_id)}><ArrowDownward fontSize="inherit" /></IconButton>
                                </React.Fragment>
                            }</OrderController>
                        </If>
                    </Typography>

                    <Grid container spacing={3} sx={{ mb: 1 }} columns={{ xs: 2, sm: 4, md: 8 }}>
                        <Iterate array={items}>{(item, index) =>
                            <Grid item key={item._id} xs={1} sx={{ width: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <IconButton color="warning" sx={{ width: 60, height: 60 }} onClick={() => onClick(item)}>{iconRender(item)}</IconButton>
                                <Typography sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center", width: 120 }} variant="caption">{item.name}</Typography>
                                <If condition={editOrder}>
                                    <OrderController<T> dbName={itemsDb} filter={record => record.groupId === item.groupId}>{controller =>
                                        <div>
                                            <IconButton size="small" disabled={index === 0} onClick={() => controller.moveUp(item._id)}><ArrowBack fontSize="inherit" /></IconButton>
                                            <IconButton size="small" disabled={index === items.length - 1} onClick={() => controller.moveDown(item._id)}><ArrowForward fontSize="inherit" /></IconButton>
                                        </div>
                                    }</OrderController>
                                </If>
                            </Grid>
                        }</Iterate>
                    </Grid>
                </React.Fragment>
            }</Iterate>
        }</Records>
    }</Records>
);
