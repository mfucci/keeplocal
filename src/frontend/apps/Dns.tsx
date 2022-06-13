/** 
 * Network scanner app.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Grid } from "@mui/material";
import React from "react";
import { SectionCard } from "../components/SectionCard";

import "./icons/dns.png";

type Props = {};
type State = {};

export class Dns extends React.Component<Props, State> {

    render() {
        return (
            <Grid container spacing={3}>
                <SectionCard>
                    DNS configuration.
                </SectionCard>

                <SectionCard>
                    TODO: add something here.
                </SectionCard>
            </Grid>
        );
    }
}
