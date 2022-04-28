/** 
 * Page to view / edit the local apps.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Grid } from "@mui/material";

import { App, APPS_DATABASE, APPS_GROUPS_DATABASE } from "../models/App";
import { SectionCard } from "../components/SectionCard";
import { GroupList } from "../components/GroupList";

type Props = {};
type State = {};

export class AppsView extends React.Component<Props, State> {

    render() {
        return (
            <Grid container spacing={3}>
                <SectionCard>
                    <GroupList<App>
                        groupsDb={APPS_GROUPS_DATABASE}
                        itemsDb={APPS_DATABASE}
                        pathBuilder={app => `/${app._id}`}
                        iconRender={app => <img width="50px" height="50px" src={`/img/${app.icon}`} />} />
                </SectionCard>
            </Grid>
        );
    }
}
