import React from "react";

import styles from "./DeviceList.css";
import { DatabaseContext } from "../data/DatabaseContext";
import { DatabaseManager } from "../data/DatabaseManager";
import { Record } from "../data/Record";
import { NetworkDevice, State as GateState } from "../../daemon/NetworkDevices";
import { format } from "timeago.js";

type Props = {};
type State = {};

export class DeviceList extends React.Component<Props, State> {
    private databaseManager = new DatabaseManager("ws://localhost:3432/");

    render = () =>
        <DatabaseContext.Provider value={ {databaseManager: this.databaseManager} }>
            <table className={styles.DeviceList}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Hostname</th>
                        <th>Class</th>
                        <th>IP</th>
                        <th>IP type</th>
                        <th>MAC</th>
                        <th>State</th>
                        <th>Changes pending</th>
                        <th>Last seen</th>
                    </tr>
                </thead>
                <tbody>
                    <Record<string[]> id="/devices" render={deviceIds => deviceIds.map(id => 
                        <Record<NetworkDevice> key={id} id={`/device/${id}`} render={ ({ name, ip, ipType, mac, pendingChanges, state, vendor, classId, hostname, lastSeen }, updater) =>
                            <tr>
                                <td><input type="text" value={name} onChange={({target: {value: name}}) => updater({name})} /></td>
                                <td>{hostname}</td>
                                <td>{classId}</td>
                                <td>{ip}</td>
                                <td>{ipType}</td>
                                <td>{`${mac} (${vendor})`}</td>
                                <td>
                                    <select value={state} onChange={({target: {value: stateString}}) => updater({state: GateState[stateString as GateState]})}>
                                        <option value={GateState.GATED}>Gated</option>
                                        <option value={GateState.UNGATED}>Ungated</option>
                                    </select>
                                </td>
                                <td>{pendingChanges}</td>
                                <td>{lastSeen ? format(lastSeen) : "N/A"}</td>
                            </tr>
                        } />
                    )} />
                </tbody>
            </table>
        </DatabaseContext.Provider>;
}
