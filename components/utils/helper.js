import requestIp from "request-ip";

import {v4 as uuidv4} from 'uuid';
import moment from "moment";
import {DownloadHistory} from "../api/models/download.history.model.js";
import File from "../api/models/file.model.js";
import Configuration from "../api/models/configuration.model.js";

export const allowedFileTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

export const generateRandomFilename = (img_prefix = '') => {
    return `${img_prefix}-${uuidv4()}`;
}

export const getPageDetails = (limit, page, count) => {
    const total_pages = Math.ceil(count / limit);
    const has_previous = page > 1;
    const has_next = page < total_pages;
    const current_page = page;
    const prevPage = has_previous ? current_page - 1 : null;
    const nextPage = has_next ? current_page + 1 : null;
    return {
        current_page,
        has_previous,
        has_next,
        prevPage,
        nextPage,
        total_pages,
        total_items: count
    };
};

export const updateDownloadCount = async (ipAddress, publicKey) => {
    try {
        const downloadDate = moment().startOf('day').toDate();
        await DownloadHistory.findOneAndUpdate({ipAddress, downloadDate}, {$inc: {downloadCount: 1}}, {
            upsert: true,
            new: true,
            strictQuery: true
        });

        await File.updateMany({publicKey}, {$set: {lastDownloadDate: moment().toDate()}});

    } catch (error) {
        console.error(error);
        let errorMessage = `Failed to update download history`;
        console.log('errorMessage:', errorMessage)
    }
};


if (global.onStartingResetAllDataFromDB) {

    DownloadHistory.deleteMany({}, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Deleted ${result.deletedCount} documents from DownloadHistory`);
        }
    });
    Configuration.deleteMany({}, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Deleted ${result.deletedCount} documents from Configuration`);
        }
    });

    File.deleteMany({}, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Deleted ${result.deletedCount} documents from File`);
        }
    })
}
