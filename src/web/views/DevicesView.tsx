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
import { Device, DEVICE_KEY_BY_ID, DEVICE_LIST_KEY, DEVICE_GROUP_LIST_KEY } from "../models/Device";
import { RecordArray } from "../database/RecordArray";
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
            <RecordArray<Device> id={DEVICE_LIST_KEY} itemIdMapper={DEVICE_KEY_BY_ID}>{devices => 
                <Grid container spacing={3}>
                    <SectionCard>
                        {devices.length} devices, {devices.filter(device => device.online).length} online
                    </SectionCard>

                    <SectionCard>
                        <GroupList groupsKey={DEVICE_GROUP_LIST_KEY} itemsKey={DEVICE_LIST_KEY} items={devices} editOrder={editOrder} iconRender={device => <DeviceCategoryIcon category={device.category} sx={{ width: 40, height: 40 }} />} />
                    </SectionCard>

                    <SectionCard>
                        <Button variant="outlined" sx= {{ width: "fit-content" }} onClick={()=>this.setState({editOrder: !editOrder})}>
                            {editOrder ? "Done" : "Reorder"}
                        </Button>
                    </SectionCard>
                </Grid>
            }</RecordArray>
        );
    }
}
