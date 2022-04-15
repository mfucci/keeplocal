/** 
 * Main page of the UI.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import ReactDom from "react-dom";
import { Route, Routes } from "react-router";

import "./index.css";
import "./index.html";
import "./icons/favicon.svg";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { BrowserRouter } from "react-router-dom";

import { Network } from "./views/NetworkView";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { DeviceViewRouter } from "./views/DeviceView";
import { Box, Container } from "@mui/material";

import "./service-worker.js";

const Index = () => {
    return (<BrowserRouter>
        <Header />

        <Box
            component="main"
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === "light"
                    ? theme.palette.grey[100]
                    : theme.palette.grey[900],
                flexGrow: 0,
                flexShrink: 1,
                flexBasis: "auto",
                overflow: "auto",
                height: "100vh",
            }} >

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Routes>
                    <Route path="/device/:id" element={
                        <DeviceViewRouter />
                    }/>
                    <Route path="*" element={
                        <Network />
                    }/>
                </Routes>

                <Footer />
            </Container>
        </Box>
    </BrowserRouter>
    );
}

const root = document.getElementById("root");
if (root !== null) {
    ReactDom.render(<Index />, root);
    
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js"));
    }
}
