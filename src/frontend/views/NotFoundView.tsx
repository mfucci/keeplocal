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

export class NotFoundView extends React.Component {

    render() {
        return (
            <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                     This page doesn&apos;t exist.
                     <Link color="inherit" to="/">Back to home</Link>
                </Paper>
            </Grid>
        );
    }
}
