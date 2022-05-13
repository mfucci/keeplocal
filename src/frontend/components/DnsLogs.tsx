import React, { Component } from 'react';
import { SectionCard } from "./SectionCard";
import { Records } from "../database/Records";
import { DnsEvent, NetworkEventLog, NETWORK_EVENT_DATABASE } from '../../common/models/NetworkEvent';
import { TableContainer, Table, TableRow, TableHead, TableCell, TableBody, Paper, Typography } from '@mui/material';
import { Iterate } from '../react/Iterate';
import moment from 'moment'

type Props = {
  id: string;
};
type State = {};

export default class DnsLogs extends Component<Props, State> {
  render() {
    return (
      <SectionCard>
        <Typography gutterBottom variant="h5" component="div" color="primary">DNS Logs</Typography>
        {/* TODO: integrate react-virtualized */}
        <TableContainer sx={{ maxHeight: 440 }} component={Paper}>
          <Table stickyHeader size="small" aria-label="Dns Log table">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Domain</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <Records<NetworkEventLog<DnsEvent>> dbName={NETWORK_EVENT_DATABASE}>
                {(logs) => <Iterate array={logs}>{
                  (log) => {
                    if (log.device_id === this.props.id && log.service === 'DNS') return (
                      <TableRow key={log?.timestamp}>
                        <TableCell>{moment(log?.timestamp).format('YYYY-MM-DD hh:mm:ss a')}</TableCell>
                        <TableCell>{log?.event?.type}</TableCell>
                        <TableCell>{log?.event?.name}</TableCell>
                      </TableRow>
                    )
                    return null;
                  }
                }</Iterate>}
              </Records>
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>
    )
  }
}