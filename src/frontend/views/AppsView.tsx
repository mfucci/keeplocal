/**
 * Page to view / edit the local apps.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Grid } from "@mui/material";

import {
  App,
  APPS_DATABASE,
  APPS_GROUPS_DATABASE,
  AppType,
} from "../../common/models/App";
import { SectionCard } from "../components/SectionCard";
import { GroupList } from "../components/GroupList";
import { Navigate } from "../components/Navigate";

type Props = {};
type State = {};

export class AppsView extends React.Component<Props, State> {
  render() {
    return (
      <Grid container spacing={3}>
        <SectionCard>
          <Navigate>
            {(navigate) => (
              <GroupList<App>
                groupsDb={APPS_GROUPS_DATABASE}
                itemsDb={APPS_DATABASE}
                onClick={({ type, url }) =>
                  type === AppType.BuiltIn
                    ? navigate(url)
                    : location.assign(url)
                }
                iconRender={(app) => (
                  <img width="50px" height="50px" src={`/img/${app.icon}`} />
                )}
              />
            )}
          </Navigate>
        </SectionCard>
      </Grid>
    );
  }
}
