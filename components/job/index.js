import agenda from './agenda.js'

import inactiveStorageCleanup from '../job/inactive.storage.cleanup.js';
import {file_upload_configurations} from "../config/index.js";

agenda.define('cleanup task', async (job, done) => {
    console.log('Running cleanup task...');
    await inactiveStorageCleanup();
    done();
});


(async function () {
    await agenda.start();
    await agenda.every(file_upload_configurations.STORAGE_CLEANUP_SCHEDULE, 'cleanup inactive files');
})();
