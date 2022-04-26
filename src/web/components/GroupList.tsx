import React from "react";

import { Divider, Grid, IconButton, Typography } from "@mui/material";

import { If } from "../react/If";
import { Iterate } from "../react/Iterate";
import { Group } from "../models/Group";
import { Link } from "react-router-dom";
import { ArrowBack, ArrowDownward, ArrowForward, ArrowUpward } from "@mui/icons-material";
import { GroupController } from "../controllers/GroupController";

export type GroupItem = {
    id: string,
    name: string,
    groupId: number,
}

function moveDeviceRight() {

}

function moveDeviceLeft() {
    
}

type ItemRenderProps<T extends GroupItem> = {
    item: T,
    items: T[],
    iconRender: (item: T) => any,
    first: boolean,
    last: boolean,
    editOrder: boolean,
    controller: GroupController<T>,
};
const ItemRender = <T extends GroupItem>({item, items, iconRender, first, last, editOrder, controller}: ItemRenderProps<T>) => (
    <Grid item xs={1} sx={{ width: 80, display: "flex", flexDirection: "column", alignItems: "center", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        <IconButton color="warning" sx={{ width: 60, height: 60 }} component={Link} to={`/${item.id}`}>{iconRender(item)}</IconButton>
        {item.name}
        <If condition={editOrder}>
            <div>
                <IconButton size="small" disabled={first} onClick={() => controller.moveGroupItemLeft(items, item)}><ArrowBack fontSize="inherit" /></IconButton>
                <IconButton size="small" disabled={last} onClick={() => controller.moveGroupItemRight(items, item)}><ArrowForward fontSize="inherit" /></IconButton>
            </div>
        </If>
    </Grid>
);

type GroupRenderProps<T extends GroupItem> = {
    iconRender: (item: T) => any,
    group: Group,
    items: T[],
    first: boolean,
    last: boolean,
    editOrder: boolean,
    controller: GroupController<T>,
};
const GroupRender = <T extends GroupItem>({iconRender, items, group: {name, id}, first, last, editOrder, controller}: GroupRenderProps<T>) => (
    <React.Fragment>
        <Typography sx={{ mt: 0.5, ml: 2, mb: 1 }} color="text.secondary" display="block" variant="subtitle1">
            {name}
            <If condition={editOrder}>
                <IconButton size="small" disabled={first} onClick={() => controller.moveGroupUp(id)}><ArrowUpward fontSize="inherit" /></IconButton>
                <IconButton size="small" disabled={last} onClick={() => controller.moveGroupDown(id)}><ArrowDownward fontSize="inherit" /></IconButton>
            </If>
        </Typography>

        <Grid container spacing={3} sx={{ mb: 1 }} columns={{ xs: 2, sm: 4, md: 8, lg: 10 }}>
            <Iterate array={items}>{(item, index) =>
                <ItemRender<T>
                    key={item.id}
                    item={item}
                    items={items}
                    iconRender={iconRender}
                    first={index === 0}
                    last={index === items.length - 1}
                    editOrder={editOrder}
                    controller={controller}
                />
            }</Iterate>
        </Grid>
    </React.Fragment>
);

export const GroupList = <T extends GroupItem>({iconRender, groupsKey, itemsKey, items, editOrder = false}: {groupsKey: string, itemsKey: string, items: T[], iconRender: (item: T) => any, editOrder?: boolean}) => (
    <GroupController groupsKey={groupsKey} itemsKey={itemsKey}>{(groups, controller) =>
        <Iterate array={groups.map((group) => ({group, items: items.filter(item => item.groupId === group.id)})).filter(({items}) => items.length > 0)}>{({group, items}, index) =>
            <React.Fragment key={group.id}>
                <If condition={index > 0}><Divider /></If>
                <GroupRender<T>
                    group={group}
                    items={items}
                    iconRender={iconRender}
                    editOrder={editOrder}
                    first={index === 0}
                    last={index === groups.length - 1}
                    controller={controller}
                />
            </React.Fragment>
        }</Iterate>
    }</GroupController>
);
