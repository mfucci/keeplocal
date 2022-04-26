/** 
 * Page to view / edit the local apps.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Grid } from "@mui/material";

import { App, APP_GROUP_LIST_KEY, APP_KEY_BY_ID, APP_LIST_KEY } from "../models/App";
import { RecordArray } from "../database/RecordArray";
import { SectionCard } from "../components/SectionCard";
import { GroupList } from "../components/GroupList";

type Props = {};
type State = {};

export class AppsView extends React.Component<Props, State> {

    render() {
        return (
            <RecordArray<App> id={APP_LIST_KEY} itemIdMapper={APP_KEY_BY_ID}>{apps =>
                <Grid container spacing={3}>
                    <SectionCard>
                        <GroupList groupsKey={APP_GROUP_LIST_KEY} itemsKey={APP_LIST_KEY} items={apps} iconRender={app => <img width="50px" height="50px" src={`/img/${app.icon}`} />} />
                    </SectionCard>
                </Grid>
            }</RecordArray>
        );
    }
}
