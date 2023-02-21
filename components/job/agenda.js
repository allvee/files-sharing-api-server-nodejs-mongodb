import Agenda from 'agenda';
import '../config/env.config.js';

const env = process.env;

const mongoConnectionString = env.MONGO_CONNECTION_STRING
export const agenda = new Agenda({db: {address: mongoConnectionString}}); //, collection: 'jobCollectionName'

export default agenda