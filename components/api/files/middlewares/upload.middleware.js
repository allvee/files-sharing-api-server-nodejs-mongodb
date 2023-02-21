import multer from 'multer';
import path from 'path';

import {file_upload_configurations} from '../../../config/index.js';

import {generateRandomFilename, allowedFileTypes} from '../../../utils/helper.js';

let storage = multer.diskStorage({
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
            console.log('error:', err)
            let error = {}
            error.errorMessage = err.statusMessage
            error.errorName = err.name
            return callback(error);
        }


    }
});
const fileUpload = multer({
    storage,
    limits: {
        fileSize: file_upload_configurations.MAX_FILE_SIZE_IN_KB * 1024,
        files: file_upload_configurations.MAX_FILE_LIMIT
    },
    fileFilter: (req, file, callback) => {
        const extname = path.extname(file.originalname).toLowerCase();

        if (allowedFileTypes.includes(extname)) {

            callback(null, true);

        } else {
            let errorMessage = `Only ${allowedFileTypes}  files are allowed`;
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

export const uploadFilesMiddleware = fileUpload.any();
export const formDataParser = multer().none();