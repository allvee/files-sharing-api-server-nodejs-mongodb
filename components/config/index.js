import './env.config.js';

const env = process.env;

export let general_configurations = {
    "APPLICATION_BASE_URL": env.APPLICATION_BASE_URL,
    "APPLICATION_NAME": env.APPLICATION_NAME,
    "PORT": env.PORT,
    "FTP_DIRECTORY": env.FTP_DIRECTORY,
    "VIEW_DIRECTORY": env.VIEW_DIRECTORY,
}
export let file_upload_configurations = {
    "FOLDER": env.FOLDER,
    "MAX_FILE_SIZE_IN_KB": parseInt(env.MAX_FILE_SIZE_IN_KB),
    "MAX_FILE_LIMIT": parseInt(env.MAX_FILE_LIMIT),
}
export default {
    general_configurations,
    file_upload_configurations
};