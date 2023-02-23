import {DownloadHistory} from '../../models/download.history.model.js';
import {Configuration} from "../../models/configuration.model.js";

import moment from 'moment';
import {file_upload_configurations} from "../../../config/index.js";

export async function canDownload(req, res, next) {

    const clientIpAddress = req.clientIp;
    const today = moment().startOf('day').toDate();
    const config = await Configuration.findOne({
        startDate: {$lte: today},
        endDate: {$gte: today}
    });

    let maxDownloadsPerIp;

    if (!config) {
        maxDownloadsPerIp = file_upload_configurations.MAX_DOWNLOADS_PER_IP || 5;
    } else {
        maxDownloadsPerIp = config.maxDownloadsPerIp;
    }

    console.log('maxDownloadsPerIp:', maxDownloadsPerIp);
    console.log('clientIpAddress:', clientIpAddress);
    console.log('downloadDate:', today);

    let downloadHistory = await DownloadHistory.findOne({ipAddress: clientIpAddress, downloadDate: today});
    console.log('downloadHistory:', downloadHistory)

    if (!downloadHistory || downloadHistory.downloadCount < maxDownloadsPerIp) {
        return next()
    } else {
        return res.status(401).send({successStatus: false, errorMessage: 'Download limit excited'});
    }
}


