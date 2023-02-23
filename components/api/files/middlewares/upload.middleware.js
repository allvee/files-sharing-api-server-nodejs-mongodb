import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {file_upload_configurations} from '../../../config/index.js';

import {generateRandomFilename, allowedFileTypes} from '../../../utils/helper.js';
import moment from "moment";
import {Configuration} from "../../models/configuration.model.js";
import {File} from "../../models/file.model.js";

import {Storage} from '@google-cloud/storage';

let storage;

if (file_upload_configurations.PROVIDER === 'google') {
    storage = new multer.memoryStorage();
}

if (!storage) {
    storage = multer.diskStorage({
        destination: file_upload_configurations.FOLDER,
        filename: function (req, file, callback) {
            try {
                if (file.fieldname === undefined) {
                    let errorMessage = `Field name missing`;
                    const error = new Error();
                    error.name = 'FieldNameMissing';
                    error.message = errorMessage;
                    error.stack = 'FieldNameMissing';
                    return callback(error);
                }

                const originalName = file.originalname;
                const {name: originalNameWithoutExt, ext: originalNameExt} = path.parse(originalName);
                const firstWord = originalNameWithoutExt.split(' ')[0];
                const randomName = generateRandomFilename(firstWord);
                const fileName = `${randomName}${originalNameExt}`;

                callback(null, fileName);

            } catch (err) {
                console.log('error:', err);
                let error = {};
                error.errorMessage = err.statusMessage;
                error.errorName = err.name;
                return callback(error);
            }
        }
    });
}

const fileUpload = multer({
    storage,
    limits: {
        fileSize: file_upload_configurations.MAX_FILE_SIZE_IN_KB * 1024,
        files: file_upload_configurations.MAX_UPLOAD_FILE_LIMIT
    },
    fileFilter: (req, file, callback) => {
        const extname = path.extname(file.originalname).toLowerCase();
        if (allowedFileTypes.includes(extname)) {
            callback(null, true);
        } else {
            let errorMessage = `Only ${allowedFileTypes} files are allowed`;
            const error = new Error();
            error.name = 'ExtensionError';
            error.message = errorMessage;
            error.stack = 'ExtensionError';
            return callback(error);
        }
    },
    onError: (err, next) => {
        console.log('err:', err);
        next(err);
    }
});

export const handleFileUpload = fileUpload.any();


export const uploadToGoogleCloudStorage = async (bucketName, fileName, fileBuffer, mimeType) => {
    return new Promise(async (resolve, reject) => {
        try {
            const {keyFilename, bucketName} = file_upload_configurations.CONFIG.google;
            const credentials = JSON.parse(await fs.readFileSync(keyFilename));

            //console.log('credentials:', credentials.google);
            const storageInstance = new Storage({
                projectId: credentials.google.project_id,
                credentials: {
                    client_email: credentials.google.client_email,
                    private_key: credentials.google.private_key,
                },
            });

            const bucket = storageInstance.bucket(bucketName);

            const blob = bucket.file(fileName);

            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: mimeType,
                },
                resumable: false,
            });
            await new Promise((resolve, reject) => {
                console.log('i m going')
                blobStream.on('error', (error) => {
                    console.error(`Error uploading file: ${error}`);
                    reject(error);
                });

                blobStream.on('finish', () => {
                    console.log(`Successfully uploaded file: ${fileName}`);
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                    const metadata = blob.metadata;
                    const uploadedFile = {
                        metadata,
                        fileName: metadata.name,
                        size: metadata.size,
                        mimeType: metadata.contentType,
                        publicUrl: publicUrl,
                    };
                    resolve(uploadedFile);
                });

                blobStream.end(fileBuffer);
            });

        } catch (err) {
            console.log('error in uploadToGoogleCloudStorage', err);
            reject(err);
        }
    });
};

export async function canUpload(req, res, next) {

    const clientIpAddress = req.clientIp;
    const today = moment().startOf('day').toDate();
    const startOfToday = moment().startOf('day').toDate();
    const endOfToday = moment().endOf('day').toDate();


    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const config = await Configuration.findOne({
        startDate: {$lte: today},
        endDate: {$gte: today}
    });

    let maxUploadsPerIp;

    if (!config) {
        maxUploadsPerIp = file_upload_configurations.MAX_UPLOADS_PER_IP || 5;
    } else {
        maxUploadsPerIp = config.maxUploadsPerIp;
    }

    console.log('maxUploadsPerIp:', maxUploadsPerIp);
    console.log('clientIpAddress:', clientIpAddress);
    let uploadHistory;
    let uploadCount = 0;
    try {
        uploadHistory = await File.aggregate([
            {
                $match: {
                    ipAddress: clientIpAddress,
                    createdAt: {$gte: startOfToday, $lte: endOfToday}
                }
            },
            {
                $group: {
                    _id: "$ipAddress",
                    count: {$sum: 1}
                }
            }
        ]);
        console.log('uploadHistory:', uploadHistory)
        uploadCount = uploadHistory.length ? uploadHistory[0].count : 0;

    } catch (e) {
        console.log('err', e)
        return res.status(500).send({successStatus: false, errorMessage: 'Internal Server Error'});
    }

    if (uploadCount < maxUploadsPerIp) {
        return next();
    } else {
        return res.status(401).send({successStatus: false, errorMessage: 'Daily Upload Limit Exceeded'});
    }
}
