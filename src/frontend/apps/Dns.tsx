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
import { Records } from "../database/Records";
import { NetworkEventLog, NETWORK_EVENT_DATABASE } from "../../common/models/NetworkEvent";

import "./icons/dns.png";
import { Iterate } from "../react/Iterate";

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
                    <Records<NetworkEventLog<{}>> dbName={NETWORK_EVENT_DATABASE}>{events =>
                        <Iterate array={events}>{event => 
                            JSON.stringify(event)
                        }</Iterate>
                    }</Records>
                </SectionCard>
            </Grid>
        );
    }
}
