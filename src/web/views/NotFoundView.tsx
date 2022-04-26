/** 
 * Page returned when the path is not found.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "react-router-dom";

import { Grid, Paper } from "@mui/material";

type Props = {};
type State = {};

export class NotFoundView extends React.Component<Props, State> {

    render() {
        return (
            <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                     This page doesn't exist.
                     <Link color="inherit" to="/">Back to home</Link>
                </Paper>
            </Grid>
        );
    }
}
