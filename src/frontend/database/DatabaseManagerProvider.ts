import React from "react";
import { DatabaseManager } from "../../common/database/DatabaseManager";
import { DemoDatabaseManager } from "./DemoDatabaseManager";

export type Props = {
    databaseUrl: string;
    children: (manager: DatabaseManager) => any,
};

export type State = {
    manager?: DatabaseManager,
}

export class DatabaseManagerProvider extends React.Component<Props, State> {

    async componentDidMount() {
        const { databaseUrl } = this.props;
        if (databaseUrl === "demo") {
            const manager = new DemoDatabaseManager()
            await manager.init();
            this.setState({ manager });
        } else {
            const manager = new DatabaseManager(databaseUrl);
            this.setState({ manager });
        }
    }

    render() {
        const { manager, children } = { ...this.state, ...this.props };
        if (manager === undefined) return null;
        return children(manager);
    }
}
