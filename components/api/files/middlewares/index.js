import {canUpload, handleFileUpload, uploadToGoogleCloudStorage} from './upload.middleware.js';
import {canDownload} from './download.middleware.js';

export default {
    handleFileUpload,
    uploadToGoogleCloudStorage,
    canDownload,
    canUpload,
}