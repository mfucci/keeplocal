/**
 * Page to view / edit a device.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useParams } from "react-router-dom";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Icon,
  MenuItem,
  Select,
  Switch,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import {
  DeviceCategoryIcon,
  DEVICE_CATEGORIES_LABELS,
} from "../components/DeviceCategoryUi";
import { PERMISSION_LABELS } from "../components/PermissionLabels";
import { EditableLabel } from "../components/EditableLabel";
import { NavigateContext } from "../components/Navigate";

import {
  Device,
  DEVICES_DATABASE,
  DEVICES_GROUPS_DATABASE,
  DEVICE_CATEGORIES,
  DEVICE_PERMISSIONS,
} from "../../common/models/Device";
import { Group } from "../../common/models/Group";

import { IterateObject } from "../react/Iterate";
import { If } from "../react/If";
import { AddGroupDialog } from "../common/AddGroupDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Record } from "../database/Record";
import { UNASSIGNED_GROUP_ID } from "../../common/models/Group";
import { GroupController } from "../controllers/GroupController";
import { Records } from "../database/Records";
import { SelectControl } from "../components/SelectControl";
import { With } from "../react/With";
import { Now } from "../components/Now";
import { isOnline } from "../components/Online";
import { TimeAgo } from "../components/TimeAgo";

type Props = {
  id: string;
};
type State = {};
/// { name, category = DEVICE_CATEGORIES.UNKNOWN, vendor, model, mac, ip, online, hostname, permissions, groupId }
export class DeviceDetailView extends React.Component<Props, State> {
  static contextType = NavigateContext;
  declare context: React.ContextType<typeof NavigateContext>;

  private addGroupDialog = React.createRef<AddGroupDialog<Device>>();
  private deleteDeviceConfirmDialog = React.createRef<ConfirmDialog>();

  render() {
    const { id, navigate } = { ...this.props, ...this.context, ...this.state };
    return (
      <Record<Device> dbName={DEVICES_DATABASE} id={id}>
        {(device, update, remove) => (
          <Grid container spacing={3} columns={{ xs: 6, md: 12 }}>
            <Grid item xs={12}>
              <Card>
                <With value={device}>
                  {({ name, category, vendor, model, groupId }) => (
                    <CardContent>
                      <Icon color="warning" sx={{ width: 60, height: 60 }}>
                        <DeviceCategoryIcon
                          category={category}
                          sx={{ width: 40, height: 40 }}
                        />
                      </Icon>
                      <Typography gutterBottom variant="h4" component="div">
                        <EditableLabel
                          initialValue={name}
                          onChange={(name) => update({ name })}
                        />
                      </Typography>
                      <div style={{ lineHeight: "36px" }}>
                        Vendor:{" "}
                        <EditableLabel
                          initialValue={vendor}
                          onChange={(vendor) => update({ vendor })}
                        />
                      </div>
                      <div style={{ lineHeight: "36px" }}>
                        Model:{" "}
                        <EditableLabel
                          initialValue={model}
                          onChange={(model) => update({ model })}
                        />
                      </div>
                      <div style={{ lineHeight: "36px" }}>
                        Category:
                        <SelectControl<DEVICE_CATEGORIES>
                          value={category}
                          onChange={(category) => update({ category })}
                          sx={{ marginLeft: "5px" }}
                        >
                          {Object.entries(DEVICE_CATEGORIES_LABELS).map(
                            ([key, label]) => ({ key, label })
                          )}
                        </SelectControl>
                      </div>
                      <div style={{ lineHeight: "36px" }}>
                        Group:
                        <Records<Group> dbName={DEVICES_GROUPS_DATABASE}>
                          {(groups) => (
                            <React.Fragment>
                              <SelectControl
                                value={groupId}
                                onChange={(groupId) => update({ groupId })}
                                sx={{ marginLeft: "5px" }}
                              >
                                {groups.map(({ _id, name }) => ({
                                  key: _id,
                                  label: name,
                                }))}
                              </SelectControl>
                              <Button
                                onClick={() =>
                                  this.addGroupDialog.current?.open()
                                }
                              >
                                Add group
                              </Button>

                              <GroupController
                                groupsDb={DEVICES_GROUPS_DATABASE}
                                itemsDb={DEVICES_DATABASE}
                              >
                                {(controller) => (
                                  <React.Fragment>
                                    <AddGroupDialog<Device>
                                      ref={this.addGroupDialog}
                                      onNewGroup={(groupId) =>
                                        update({ groupId })
                                      }
                                      controller={controller}
                                    />
                                    <Button
                                      disabled={groupId === UNASSIGNED_GROUP_ID}
                                      onClick={() =>
                                        controller.removeGroup(groupId)
                                      }
                                    >
                                      Delete group
                                    </Button>
                                  </React.Fragment>
                                )}
                              </GroupController>
                            </React.Fragment>
                          )}
                        </Records>
                      </div>
                    </CardContent>
                  )}
                </With>

                <CardActions>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() =>
                      this.deleteDeviceConfirmDialog.current?.open()
                    }
                  >
                    Delete
                  </Button>
                  <ConfirmDialog
                    ref={this.deleteDeviceConfirmDialog}
                    title="Are you sure you want to delete this device?"
                    message="Deleting the device will delete all data associated with this device.\nIf this device requests to join the network again, it will have a default configuration."
                    onConfirm={() => {
                      remove();
                      navigate("/");
                    }}
                  />
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={6}>
              <Card style={{ height: "100%" }}>
                <With value={device}>
                  {({ permissions }) => (
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="div"
                        color="primary"
                      >
                        Permissions
                      </Typography>
                      <FormGroup>
                        <If
                          condition={Object.entries(permissions).length !== 0}
                          otherwise="Permissions cannot be controlled on this device."
                        >
                          <IterateObject<DEVICE_PERMISSIONS, string>
                            object={PERMISSION_LABELS}
                          >
                            {(permission, label) => (
                              <If
                                key={permission}
                                condition={
                                  permissions[permission] !== undefined
                                }
                              >
                                <FormControlLabel
                                  key={permission}
                                  control={
                                    <Switch
                                      checked={permissions[permission]}
                                      onChange={(event, checked) =>
                                        update({
                                          permissions: {
                                            ...permissions,
                                            [permission]: checked,
                                          },
                                        })
                                      }
                                    />
                                  }
                                  label={label}
                                />
                              </If>
                            )}
                          </IterateObject>
                        </If>
                      </FormGroup>
                    </CardContent>
                  )}
                </With>
              </Card>
            </Grid>

            <Grid item xs={6}>
              <Card style={{ height: "100%" }}>
                <With value={device}>
                  {({
                    mac,
                    ip = "<unassigned>",
                    ipType,
                    hostname,
                    lastSeen,
                    classId,
                  }) => (
                    <Now>
                      {(now) => (
                        <CardContent>
                          <Typography
                            gutterBottom
                            variant="h5"
                            component="div"
                            color="primary"
                          >
                            Network
                          </Typography>
                          <div>MAC address: {mac}</div>
                          <div>
                            IP address: {ip} ({ipType})
                          </div>
                          <div>
                            Status:{" "}
                            {isOnline(now, device) ? "online" : "offline"} (last
                            seen:{" "}
                            {lastSeen ? (
                              <TimeAgo now={now} timestamp={lastSeen} />
                            ) : (
                              "never"
                            )}
                            )
                          </div>
                          <If condition={hostname !== undefined}>
                            <div>Hostname: {hostname}</div>
                          </If>
                          <If condition={classId !== undefined}>
                            <div>Class ID: {classId}</div>
                          </If>
                        </CardContent>
                      )}
                    </Now>
                  )}
                </With>
              </Card>
            </Grid>
          </Grid>
        )}
      </Record>
    );
  }
}

export const DeviceDetailViewRouter = () => {
  const { id } = useParams();
  if (id === undefined) throw new Error("Missing device id");
  return <DeviceDetailView id={id} />;
};
