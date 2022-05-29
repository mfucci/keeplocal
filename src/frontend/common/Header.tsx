/**
 * Common header for all pages.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  SxProps,
  Toolbar,
  Typography,
} from "@mui/material";

import { Iterate } from "../react/Iterate";
import { PopupMenu } from "../components/PopupMenu";
import { NavigateContext } from "../components/Navigate";

import packageJson from "../../../package.json";

const Logo = ({ sx }: { sx: SxProps<any> }) => (
  <Typography variant="h6" noWrap component="div" sx={sx}>
    KEEPLOCAL (v{packageJson.version})
  </Typography>
);
const MenuItem = ({
  label,
  handler,
}: {
  label: string;
  handler: () => void;
}) => (
  <Button sx={{ my: 2, color: "white" }} onClick={handler}>
    {label}
  </Button>
);

export class Header extends React.Component {
  static contextType = NavigateContext;
  declare context: React.ContextType<typeof NavigateContext>;

  render() {
    const { navigate } = this.context;
    const pages = [
      { label: "Devices", handler: () => navigate("/") },
      { label: "Apps", handler: () => navigate("/apps") },
      { label: "Settings", handler: () => navigate("/settings") },
      { label: "About", handler: () => navigate("/about") },
    ];
    return (
      <AppBar position="static" component="header">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ display: { xs: "flex", md: "none" } }}>
            <Box sx={{ flexGrow: 1 }}>
              <PopupMenu items={pages} />
            </Box>
            <Logo sx={{ flexGrow: 1 }} />
          </Toolbar>

          <Toolbar disableGutters sx={{ display: { xs: "none", md: "flex" } }}>
            <Logo sx={{ mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Iterate array={pages}>
                {({ label, handler }) => (
                  <MenuItem key={label} label={label} handler={handler} />
                )}
              </Iterate>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    );
  }
}
