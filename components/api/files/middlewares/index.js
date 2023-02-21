import {formDataParser, uploadFilesMiddleware} from './upload.middleware.js';
import {canUpload, canDownload} from './download.middleware.js';

export default {
    uploadFilesMiddleware,
    canDownload,
    canUpload,
    formDataParser
}