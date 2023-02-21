import mysql from 'mysql';
import util from 'util';

export function connect_db(db_configurations) {

    const connection = mysql.createConnection(db_configurations);
    console.log("DB connection established");
    return {
        query(sql, args) {
            return util.promisify(connection.query)
                .call(connection, sql, args);
        },
        close() {
            return util.promisify(connection.end).call(connection);
        }
    };
}