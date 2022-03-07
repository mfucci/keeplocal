/** 
 * List of known devices on the network.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { format } from "timeago.js";
import { Container, Card, ListGroup, ListGroupItem, Nav } from "react-bootstrap";

import { DatabaseContext } from "../data/DatabaseContext";
import { DatabaseManager } from "../data/DatabaseManager";
import { Record } from "../data/Record";
import { IpType, NetworkDevice, State as GateState } from "../../daemon/NetworkDevices";

import styles from "./NetworkDevices.css";
import { EditableText } from "../components/EditableText";

type Props = {};
type State = {};

export class NetworkDevices extends React.Component<Props, State> {
    private databaseManager = new DatabaseManager("ws://localhost:3432/");

    render = () =>
        <DatabaseContext.Provider value={ {databaseManager: this.databaseManager} }>
            <Container fluid>
                <Record<string[]> id="/devices" render={deviceIds => deviceIds.map(id => 
                    <Record<NetworkDevice> key={id} id={`/device/${id}`} render={({ name, ip, ipType, mac, pendingChanges, state, vendor, classId, hostname, lastSeen }, updater) =>
                        <Card className={styles.Card}>
                            <Card.Header className="text-muted">
                                {lastSeen ? format(lastSeen) : ""}&nbsp;{pendingChanges ? "- pending changes" : ""}
                            </Card.Header>
                            <Card.Body>
                                <Card.Title><EditableText initialValue={name} onChange={name => updater({ name })}/></Card.Title>
                                <Card.Subtitle className="mb-2 text-muted"><small>{ip} / {mac}</small></Card.Subtitle>
                            </Card.Body>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem>Vendor: {vendor}</ListGroupItem>
                                <ListGroupItem>Hostname: {hostname}</ListGroupItem>
                            </ListGroup>
                            <Card.Footer>
                                {ipType === IpType.STATIC ?
                                    <small className="text-muted">Static network configuration</small>
                                :
                                    <Nav variant="pills" defaultActiveKey={state} onSelect={stateString => updater({state: GateState[stateString as GateState]})}>
                                        <Nav.Item>
                                            <Nav.Link eventKey={GateState.UNGATED} >Ungated</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey={GateState.GATED}>Gated</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                }
                            </Card.Footer>
                        </Card>
                    }/>
                )} />
            </Container>
        </DatabaseContext.Provider>;
}
