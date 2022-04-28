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
import { Device, DEVICES_DATABASE, DEVICES_GROUPS_DATABASE } from "../models/Device";
import { Records } from "../database/Records";
import { GroupList } from "../components/GroupList";
import { SectionCard } from "../components/SectionCard";

type Props = {};
type State = {
    editOrder: boolean
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
                    <SectionCard>
                        {devices.length} devices, {devices.filter(device => device.online).length} online
                    </SectionCard>
                }</Records>

                <SectionCard>
                    <GroupList<Device>
                        groupsDb={DEVICES_GROUPS_DATABASE}
                        itemsDb={DEVICES_DATABASE}
                        editOrder={editOrder}
                        pathBuilder={device => `/device/${device._id}`}
                        iconRender={device => <DeviceCategoryIcon category={device.category} sx={{ width: 40, height: 40 }} />} />
                </SectionCard>

                <SectionCard>
                    <Button variant="outlined" sx= {{ width: "fit-content" }} onClick={()=>this.setState({editOrder: !editOrder})}>
                        {editOrder ? "Done" : "Reorder"}
                    </Button>
                </SectionCard>
            </Grid>
        );
    }
}
