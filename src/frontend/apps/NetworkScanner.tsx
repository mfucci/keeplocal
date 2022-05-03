/** 
 * Network scanner app.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Button, Grid } from "@mui/material";
import React from "react";
import { SectionCard } from "../components/SectionCard";
import { Record } from "../database/Record";
import { ScanRequest, NETWORK_SCAN_DATABASE } from "../../common/models/NetworkScan";

import "./icons/network_scanner.png";
import { DatabaseContext } from "../database/DatabaseContext";
import { IfDefined } from "../react/If";
import { LinearProgressWithLabel } from "../components/ProgressBar";
import { Lifecycle } from "../react/Lifecycle";

type Props = {};
type State = {
    requestId?: string,
};

export class NetworkScanner extends React.Component {
    render() {
        return (
            <Grid container spacing={3}>
                <SectionCard>
                    Network scanner using ping / ARP to discover all the devices on your network.
                </SectionCard>

                <NetworkScannerCard />
            </Grid>
        );
    }
}

export class NetworkScannerCard extends React.Component<Props, State> {
    static contextType = DatabaseContext;
    declare context: React.ContextType<typeof DatabaseContext>;

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    private async startScan() {
        const { databaseManager } = this.context;
        const request = await databaseManager.addRecord<ScanRequest>(NETWORK_SCAN_DATABASE, {});
        this.setState({requestId: request._id});
    }

    render() {
        const { requestId } = this.state;

        return (
            <SectionCard>
                <Button disabled={requestId !== undefined} variant="outlined" sx= {{ width: "fit-content" }} onClick={()=>this.startScan()}>
                    Scan the local network
                </Button>

                <Record<ScanRequest> dbName={NETWORK_SCAN_DATABASE} id={requestId}>{request =>
                    <Lifecycle onUmount={() => this.setState({requestId: undefined})}>
                        <IfDefined value={request.response}>{response => 
                            <React.Fragment>
                                <LinearProgressWithLabel value={response.ipsScanned*100 / response.ipsToScan} />
                            </React.Fragment>
                        }</IfDefined>
                    </Lifecycle>
                }</Record>
            </SectionCard>
        );
    }
}
