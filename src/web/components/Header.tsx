import React from "react";
import { useNavigate } from "react-router";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";

import { PopupMenu } from "../components/PopupMenu";

import packageJson from "../../../package.json";

const Logo = (props: {sx: any}) => <Typography variant="h6" noWrap component="div" sx={props.sx}>KEEPLOCAL (v{packageJson.version})</Typography>;

const NARROW_SCREEN_ONLY = { xs: "flex", md: "none" }
const WIDE_SCREEN_ONLY = { xs: "none", md: "flex" }

export function Header() {
    const navigate = useNavigate();
    const pages = [
        {label: "Dashboard", handler: () => navigate("/")},
        {label: "About", handler: () => navigate("/about")},
    ];

    return (
        <AppBar position="static" component="header">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box sx={{ flexGrow: 1, display: NARROW_SCREEN_ONLY }} >
                        <PopupMenu items={pages} />
                    </Box>
                    <Logo sx={{ flexGrow: 1, display: NARROW_SCREEN_ONLY }} />
    
                    <Logo sx={{ mr: 2, display: WIDE_SCREEN_ONLY}} />
                    <Box sx={{ flexGrow: 1, display: WIDE_SCREEN_ONLY }} >
                        {pages.map(({label, handler}) => 
                            <Button key={label} sx={{ my: 2, color: 'white', display: 'block' }} onClick={() => handler()}>{label}</Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
