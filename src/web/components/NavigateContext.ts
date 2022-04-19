/** 
 * Holds the navigate() singleton.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { NavigateFunction } from "react-router";

type INavigateContext = {
    navigate: NavigateFunction,
}

export const NavigateContext = React.createContext<INavigateContext>({} as INavigateContext);