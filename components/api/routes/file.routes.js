import express from 'express';

const file_router = express.Router();
import validator from '../files/middlewares/index.js';

let {canUpload, canDownload, handleFileUpload} = validator;

import {
    downloadFiles,
    deleteFiles,
    getAllFiles,
    getDownloads,
    uploadFiles
} from '../files/controllers/file.controller.js';

file_router.post("/files", [canUpload, handleFileUpload, uploadFiles]);

file_router.get("/files/:publicKey", [canDownload, downloadFiles]);

file_router.delete("/files/:privateKey", [deleteFiles]);

//Extra API to get inform the files uploaded
file_router.get("/file/list", [getAllFiles]);
file_router.get("/downloads", [getDownloads]);

export default file_router;