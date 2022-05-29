/**
 * Common footer to all pages.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link, Typography } from "@mui/material";

export class Footer extends React.Component {
  render = () => (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      sx={{ pt: 4 }}
      component="footer"
    >
      {"Copyright © "}
      <Link color="inherit" href="https://github.com/mfucci/keeplocal">
        keeplocal authors
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
