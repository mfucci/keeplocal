/** 
 * Main page of the UI.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import ReactDom from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router";

import "./index.html";
import styles from "./index.css";
import "./icons/favicon.svg";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import { Header } from "./Header";
import { Footer } from "./Footer";
import { NetworkDevices } from "./page/NetworkDevices";

import "./index2";

export class Index extends React.Component { render = () =>
    <BrowserRouter>
        <Header/>

        <main className="flex-shrink-0">
            <div className={styles.Container}>
                <Routes>
                    <Route path="/" element={
                        <NetworkDevices />
                    }/>
                </Routes>
            </div>
        </main>

        <Footer/>
    </BrowserRouter>
}

const root = document.getElementById("root");
if (root !== null) {
    ReactDom.render(<Index />, root);
}
