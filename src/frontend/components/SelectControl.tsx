/** 
 * Displays a popup selection control.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { SxProps } from "@mui/material";
import { FormControl, MenuItem, Select } from "@mui/material";

export const SelectControl = <T extends string = string>({value, onChange, children, sx}: {value: T, onChange: (value: T) => void, sx: SxProps, children: {key: string, label: string}[]}) => (
    <FormControl variant="standard" sx={sx}>
        <Select value={value} onChange={({target: {value}}) => onChange(value as T)}>
            {children.map(({key, label}) => <MenuItem key={key} value={key}>{label}</MenuItem> )}
        </Select>
    </FormControl>
);