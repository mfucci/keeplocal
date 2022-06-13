/** 
 * Page to view / edit the local network.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Button, Grid } from "@mui/material";

import { DeviceCategoryIcon } from "../components/DeviceCategoryUi";
import { Device, DEVICES_DATABASE, DEVICES_GROUPS_DATABASE } from "../../common/models/Device";
import { Records } from "../database/Records";
import { GroupList } from "../components/GroupList";
import { SectionCard } from "../components/SectionCard";
import { Now } from "../components/Now";
import { isOnline } from "../components/Online";
import { Navigate } from "../components/Navigate";
import { Record } from "../database/Record";
import { APPS_DATABASE, App } from "../../common/models/App";
import { NetworkScannerCard } from "../apps/NetworkScanner";

type Props = {};
type State = {
    editOrder: boolean,
};

export class DevicesView extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            editOrder: false,
        }
    }

    render() {
        const { editOrder } = this.state;

        return (
            <Grid container spacing={3}>
                <Records<Device> dbName={DEVICES_DATABASE}>{devices => 
                    <Now>{now =>
                        <SectionCard>
                            {devices.length} devices, {devices.filter(device => isOnline(now, device)).length} online
                        </SectionCard>
                    }</Now>
                }</Records>

                <SectionCard>
                    <Navigate>{navigate => 
                        <GroupList<Device>
                            groupsDb={DEVICES_GROUPS_DATABASE}
                            itemsDb={DEVICES_DATABASE}
                            editOrder={editOrder}
                            onClick={device => navigate(`/device/${device._id}`)}
                            iconRender={device => <DeviceCategoryIcon category={device.category} sx={{ width: 40, height: 40 }} />} />
                    }</Navigate>
                </SectionCard>

                <SectionCard>
                    <Button variant="outlined" sx= {{ width: "fit-content" }} onClick={()=>this.setState({editOrder: !editOrder})}>
                        {editOrder ? "Done" : "Reorder"}
                    </Button>
                </SectionCard>

                <Record<App> dbName={APPS_DATABASE} id="network_scanner">{networkScanner =>
                    <NetworkScannerCard />
                }</Record>
            </Grid>
        );
    }
}
