import './env.config.js';
import fs from 'fs';

const env = process.env;

export let general_configurations = {
    "APPLICATION_BASE_URL": env.APPLICATION_BASE_URL,
    "APPLICATION_NAME": env.APPLICATION_NAME,
    "PORT": env.PORT,
}
export let file_upload_configurations = {
    "FOLDER": env.FOLDER,
    "MAX_FILE_SIZE_IN_KB": parseInt(env.MAX_FILE_SIZE_IN_KB),
    "MAX_UPLOAD_FILE_LIMIT": parseInt(env.MAX_UPLOAD_FILE_LIMIT),
    "MAX_UPLOADS_PER_IP": parseInt(env.MAX_UPLOADS_PER_IP),
    "MAX_DOWNLOADS_PER_IP": parseInt(env.MAX_DOWNLOADS_PER_IP),
    "INACTIVITY_LIMIT_ID_DAYS": parseInt(env.INACTIVITY_LIMIT_ID_DAYS),
    "STORAGE_CLEANUP_SCHEDULE": env.STORAGE_CLEANUP_SCHEDULE,

    "PROVIDER": env.PROVIDER || 'local',
    "CONFIG": JSON.parse(await fs.readFileSync(env.CONFIG || './provider-config.json')),
}

export let db_configurations = {
    "MONGO_CONNECTION_STRING": env.MONGO_CONNECTION_STRING,
}

export default {
    general_configurations,
    file_upload_configurations,
    db_configurations
};