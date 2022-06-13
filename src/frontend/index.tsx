/** 
 * Main page of the UI.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactChild } from "react";
import ReactDom from "react-dom";
import { Route, Routes, useNavigate } from "react-router";

import "./index.css";
import "./index.html";
import "./icons/favicon.svg";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { BrowserRouter } from "react-router-dom";

import { DevicesView } from "./views/DevicesView";
import { Header } from "./common/Header";
import { Footer } from "./common/Footer";
import { DeviceDetailViewRouter } from "./views/DeviceDetailView";
import { Box, Container } from "@mui/material";

//import "./service-worker.js";
import "./database.js";
import { DatabaseManagerProvider } from "./database/DatabaseManagerProvider";
import { DatabaseContext } from "./database/DatabaseContext";
import { NavigateContext } from "./components/Navigate";
import { NotFoundView } from "./views/NotFoundView";
import { AboutView } from "./views/AboutView";
import { AppsView } from "./views/AppsView";
import { SettingsView } from "./views/SettingsView";
import { AdBlocker } from "./apps/AdBlocker";
import { FileStorage } from "./apps/FileStorage";
import { HomeSecurity } from "./apps/HomeSecurity";
import { Router } from "./apps/Router";
import { NetworkSecurity } from "./apps/NetworkSecurity";
import { ParentalControl } from "./apps/ParentalControl";
import { VoiceAssistant } from "./apps/VoiceAssistant";
import { Email } from "./apps/Email";
import { MediaServer } from "./apps/MediaServer";
import { PrintScan } from "./apps/PrintScan";
import { HomeAutomation } from "./apps/HomeAutomation";
import { Passwords } from "./apps/Passwords";
import { DhcpServer } from "./apps/DhcpServer";
import { CreateApp } from "./apps/CreateApp";
import { InstallApp } from "./apps/InstallApp";
import { NetworkScanner } from "./apps/NetworkScanner";
import { Dns } from "./apps/Dns";

function NavigateProvider({ children }: { children: ReactChild[] }) {
    const navigate = useNavigate();
    return (
        <NavigateContext.Provider value={{ navigate }}>
            {children}
        </NavigateContext.Provider>
    );
}

export class Index extends React.Component {
    render() {
        return (
            <DatabaseManagerProvider databaseUrl={databaseUrl}>{databaseManager =>
                <DatabaseContext.Provider value={{ databaseManager }}>
                    <BrowserRouter>
                        <NavigateProvider>
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
                                        <Route path="/" element={<DevicesView />} />
                                        <Route path="/devices" element={<DevicesView />} />
                                        <Route path="/device/:id" element={<DeviceDetailViewRouter />} />
                                        <Route path="/apps" element={<AppsView />} />
                                        <Route path="/settings" element={<SettingsView />} />

                                        <Route path="/adblocker" element={<AdBlocker />} />
                                        <Route path="/dhcp_server" element={<DhcpServer />} />
                                        <Route path="/dns" element={<Dns />} />
                                        <Route path="/email" element={<Email />} />
                                        <Route path="/home_automation" element={<HomeAutomation />} />
                                        <Route path="/home_security" element={<HomeSecurity />} />
                                        <Route path="/file_storage" element={<FileStorage />} />
                                        <Route path="/media_server" element={<MediaServer />} />
                                        <Route path="/network_scanner" element={<NetworkScanner />} />
                                        <Route path="/network_security" element={<NetworkSecurity />} />
                                        <Route path="/parental_control" element={<ParentalControl />} />
                                        <Route path="/passwords" element={<Passwords />} />
                                        <Route path="/print_scan" element={<PrintScan />} />
                                        <Route path="/router" element={<Router />} />
                                        <Route path="/voice_assistant" element={<VoiceAssistant />} />

                                        <Route path="/app/create" element={<CreateApp />} />
                                        <Route path="/app/install" element={<InstallApp />} />

                                        <Route path="/about" element={<AboutView />} />
                                        <Route path="*" element={<NotFoundView />} />
                                    </Routes>

                                    <Footer />
                                </Container>
                            </Box>
                        </NavigateProvider>
                    </BrowserRouter>
                </DatabaseContext.Provider>
            }</DatabaseManagerProvider>
        );
    }
}

const root = document.getElementById("root");
if (root !== null) {
    ReactDom.render(<Index />, root);

    /*if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js"));
    }*/
}
