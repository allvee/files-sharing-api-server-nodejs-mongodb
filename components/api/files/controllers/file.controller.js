import {v4 as uuidv4} from 'uuid';
import fs from 'fs';
import archiver from 'archiver';
import '../../../config/env.config.js';

import {getPageDetails, updateDownloadCount} from "../../../utils/helper.js";
import File from "../../models/file.model.js";
import DownloadHistory from "../../models/download.history.model.js";

export const uploadFiles = async (req, res) => {
    let response = {}
    response.successStatus = false;
    const clientIpAddress = req.clientIp;
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({error: 'No files uploaded'});
        }
        const files = req.files.filter((file) => file.fieldname);
        if (files.length === 0) {
            response.errorMessage = 'Files not uploaded correctly'
            return res.status(400).send(response);
        }

        const publicKey = uuidv4();
        const privateKey = uuidv4();

        const uploadedFiles = req.files.map(file => ({
            ipAddress: clientIpAddress,
            originalName: file.originalname,
            publicKey,
            privateKey,
            size: parseInt(file.size / 1024),
            mimetype: file.mimetype,
            filepath: file.path
        }));

        let result = await File.create(uploadedFiles);
        response.successStatus = true
        response.publicKey = publicKey
        response.privateKey = privateKey
        console.log('resp:', result)

        res.json(response);

    } catch (err) {
        console.error(err);
        response.errorMessage = err.message
        res.status(500).send(response);
    } finally {

    }
};

export const downloadFiles = async (req, res) => {
    let response = {};
    response.successStatus = false;

    const clientIpAddress = req.clientIp;
    const {publicKey} = req.params;

    try {

        if (!publicKey) {
            response.errorMessage = `Please provide a valid key to download`;
            res.status(500).json(response);
        }
        const files = await File.find({publicKey: publicKey});
        console.log('files:', files);

        if (files.length === 0) {
            response.errorMessage = 'File not found'
            return res.status(404).json(response);
        }

        if (files.length !== 1) {
            const zipFilename = `${publicKey}.zip`;
            res.setHeader('Content-disposition', `attachment; filename=${zipFilename}`);
            res.setHeader('Content-type', 'application/zip');

            const archive = archiver('zip', {
                zlib: {level: 9} // Sets the compression level.
            });

            archive.on('error', (err) => {
                console.log(err);
                response.errorMessage = err.message
                res.status(500).send(response);
            });
            archive.pipe(res);
            for (const file of files) {
                const filename = file.originalName;
                const fileStream = fs.createReadStream(file.filepath);
                archive.append(fileStream, {name: filename});
            }

            await archive.finalize();
        } else {
            res.setHeader('Content-disposition', `attachment; filename=${files[0].originalName}`);
            res.setHeader('Content-type', files[0].mimetype);

            const fileStream = fs.createReadStream(files[0].filepath);
            fileStream.pipe(res);

            await new Promise((resolve, reject) => {
                fileStream.on('end', () => {
                    resolve();
                });
                fileStream.on('error', (err) => {
                    console.log(err);
                    response.errorMessage = err.message;
                    res.status(500).send(response);
                    reject(err);
                });
            });
        }
        await updateDownloadCount(clientIpAddress, publicKey);

    } catch (err) {
        console.log(err);
        response.errorMessage = err.message
        res.status(500).send(response);
    }
};

export const deleteFiles = async (req, res) => {
    let response = {};
    response.successStatus = false;
    const {privateKey} = req.params;
    try {
        if (!privateKey) {
            response.errorMessage = `Please provide a valid key to delete files`;
            res.status(500).json(response);
        }
        const files = await File.find({privateKey});
        console.log('files:', files)

        if (!files || files.length === 0) {
            response.errorMessage = 'File not found'
            return res.status(404).json(response);
        }

        for (const file of files) {
            const {filepath} = file;
            // Delete the file from the local file system
            fs.unlink(filepath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filepath}: ${err}`);
                } else {
                    console.log(`Deleted file ${filepath}`);
                }
            });
        }
        const result = await File.deleteMany({privateKey}); // Delete the files from the database

        response.successStatus = true;
        response.message = `Deleted ${result.deletedCount} files`;
        res.json(response)

    } catch (error) {
        console.log(error);
        response.errorMessage = error.message;
        res.status(500).send(response);
    } finally {

    }
};

export const getAllFiles = async (req, res) => {
    let response = {};
    response.successStatus = false;
    let {page, pageSize} = req.params;
    try {
        if (!page) page = 1;
        if (!pageSize) pageSize = 25;

        const result = await File.paginate({}, {page, limit: pageSize});

        const files = result.docs;
        const pageDetails = getPageDetails(pageSize, result.page, result.totalDocs);

        response.data = files;
        response.pagination = pageDetails;

        response.successStatus = true;
        return res.status(200).send(response);
    } catch (err) {
        console.log(err);
        response.errorMessage = err.message
        return res.status(500).send(response);
    }
};

export const getDownloads = async (req, res) => {
    let response = {};
    response.successStatus = false;
    let {page, pageSize} = req.params;
    try {
        if (!page) page = 1;
        if (!pageSize) pageSize = 25;

        const result = await DownloadHistory.paginate({}, {page, limit: pageSize});

        const downloads = result.docs;
        const pageDetails = getPageDetails(pageSize, result.page, result.totalDocs);

        response.data = downloads;
        response.pagination = pageDetails;

        response.successStatus = true;
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        response.errorMessage = err.message
        return res.status(500).json(response);
    }
};

