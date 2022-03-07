/** 
 * Editable text item.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { KeyboardEvent } from "react";

import styles from "./EditableText.css";

type Props = {
    initialValue: string,
    onChange: (value: string) => void,
};

type State = {
    edit: boolean,
    value: string,
};

export class EditableText extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            edit: false,
            value: this.props.initialValue,
        }
    }

    private handleValueChanged(value: string) {
        const { onChange } = this.props;
        this.setState({ edit: false, value });
        onChange(value);
    }

    private handleKeyPressedEvent(event: KeyboardEvent) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        this.handleValueChanged((event.target as HTMLInputElement).value);
    }

    render() {
        const { edit, value } = this.state;
        if (edit) {
            return (
                <input autoFocus className={styles.EditInput} type="text" defaultValue={value} onBlur={({target: { value }}) => this.handleValueChanged(value)} onKeyPress={event => this.handleKeyPressedEvent(event)}/>
            );
        } else {
            return (
                <span onClick={() => this.setState({ edit: true })}>
                    {this.state.value}&nbsp;<i className={`bi bi-pencil-fill ${styles.EditIcon}`}></i>
                </span>
            );
        }
    }
}
