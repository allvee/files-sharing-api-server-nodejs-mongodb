/*import Agenda from 'agenda';
import '../config/env.config.js';

const env = process.env;

const mongoConnectionString = env.MONGO_CONNECTION_STRING
const agenda = new Agenda({db: {address: mongoConnectionString}});*/

import agenda from './agenda.js'

import inactiveStorageCleanup from '../job/inactive.storage.cleanup.js';

agenda.define('cleanup task', async (job, done) => {
    console.log('Running cleanup task...');
    await inactiveStorageCleanup();
    done();
});

/*(async () => {
    agenda.define('cleanup expired files', inactiveStorageCleanup);

    await agenda.start();
    await agenda.every(global.cleanupSchedule, 'cleanup expired files');
})();*/

(async function () {
    await agenda.start();
    await agenda.every(global.cleanupSchedule, 'cleanup inactive files');
})();
