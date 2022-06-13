/** 
 * About view.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

 import React from "react";
 
 import { Grid, Paper } from "@mui/material";
 
 type Props = {};
 type State = {};
 
 export class AboutView extends React.Component<Props, State> {
 
     render() {
         return (
             <Grid item xs={12}>
                 <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                      About KeepLocal, TODO
                 </Paper>
             </Grid>
         );
     }
 }
 