import PouchDB from "pouchdb";
import { DatabaseManager } from "../../../common/database/DatabaseManager";
import { getPersistentStorageDir } from "../../utils/Paths";
 
export const LocalPouchDb = PouchDB.defaults({ prefix: getPersistentStorageDir("database") });

export class LocalDatabaseManager extends DatabaseManager {
    constructor() {
        super("");
    }

    protected createdNewDatabase<T>(name: string): PouchDB.Database<T> {
        return new LocalPouchDb(name);
    }
}
