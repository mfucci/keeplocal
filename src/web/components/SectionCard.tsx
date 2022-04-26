import React from "react";
import { Grid, Paper } from "@mui/material";

export const SectionCard = ({children}: {children: any}) => (
    <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
             {children}
        </Paper>
    </Grid>
);