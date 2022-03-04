/** 
 * Type definitions for css compatible with css-loader
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

declare module "*.css" {
    const classes: { [key: string]: string };
    export default classes;
}