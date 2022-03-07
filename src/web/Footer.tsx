/** 
 * UI footer.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "react-router-dom";

export class Footer extends React.Component { render = () => 
    <footer className="footer mt-auto py-3 bg-light">
        <div className="container">
            <span className="text-muted">&copy;&nbsp;<Link to='/author'>Keeplocal authors</Link> 2022</span>
        </div>
    </footer>
}
