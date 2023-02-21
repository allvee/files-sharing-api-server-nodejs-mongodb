import express from 'express';

const file_router = express.Router();
import validator from '../files/middlewares/index.js';

let {canUpload, canDownload, uploadFilesMiddleware} = validator;

import {
    uploadFiles,
    downloadFiles,
    deleteFiles,
    getAllFiles,
    getDownloads
} from '../files/controllers/file.controller.js';

file_router.post("/files", [canUpload, uploadFilesMiddleware, uploadFiles]);

file_router.get("/files/:publicKey", [canDownload, downloadFiles]);

file_router.delete("/files/:privateKey", [deleteFiles]);

//Extra API to get inform the files uploaded
file_router.get("/files", [getAllFiles]);
file_router.get("/downloads", [getDownloads]);

export default file_router;