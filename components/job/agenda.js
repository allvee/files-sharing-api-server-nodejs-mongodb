import Agenda from 'agenda';
import {db_configurations} from "../config/index.js";

const mongoConnectionString = db_configurations.MONGO_CONNECTION_STRING
export const agenda = new Agenda({db: {address: mongoConnectionString}});

export default agenda