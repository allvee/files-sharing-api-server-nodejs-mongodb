import {v4 as uuidv4} from 'uuid';
import moment from "moment";
import {DownloadHistory} from "../api/models/download.history.model.js";
import File from "../api/models/file.model.js";

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

export const allowedFileTypes = [
    '.doc', '.docx', '.html', '.txt', '.rtf', '.xls', '.xlsx', '.csv', '.tsv', '.ods', '.ppt', '.pptx', '.pdf', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.mp4', '.mov', '.avi', '.wmv', '.flv', '.mp3', '.m4a', '.wav', '.aac', '.aiff', '.mka', '.mkv', '.mpg', '.mpeg', '.webm', '.wma', '.ico', '.tif', '.tiff', '.eps', '.pptm', '.potm', '.ppsm', '.xlsxm', '.xlsm', '.xlsb', '.docm', '.dotm', '.odt', '.ott', '.uot', '.txt', '.csv', '.rtf', '.pdf', '.png', '.bmp', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pptm', '.potm', '.ppsm', '.mp4a', '.weba'
];

export const generateRandomFilename = (img_prefix = '') => {
    return `${img_prefix}-${uuidv4()}`;
}

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