/** 
 * Define a card for the main UI.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Grid, Paper } from "@mui/material";

export const SectionCard = ({children}: {children: any}) => (
    <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
             {children}
        </Paper>
    </Grid>
);