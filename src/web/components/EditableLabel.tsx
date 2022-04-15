/** 
 * Editable text label.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

import { TextField } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { grey } from '@mui/material/colors';

type Props = {
    initialValue?: string,
    onChange: (value: string) => void,
};

type State = {
    edit: boolean,
    value?: string,
};

export class EditableLabel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            edit: false,
            value: this.props.initialValue ?? "",
        }
    }

    private handleValueChanged(value: string) {
        const { onChange } = this.props;
        this.setState({ edit: false, value });
        onChange(value);
    }

    render() {
        const { edit, value } = {...this.state, ...this.props};
        if (edit) {
            return (
                <TextField autoFocus variant="standard" value={value} onChange={({target: { value }}) => this.setState({value})} onBlur={({target: { value }}) => this.handleValueChanged(value)} />
            );
        } else {
            return (
                <span onClick={() => this.setState({ edit: true })} >
                    {value}&nbsp;<EditIcon sx={{ color: grey[500] }} />
                </span>
            );
        }
    }
}
