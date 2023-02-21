import {DownloadHistory} from '../../models/download.history.model.js';
import {Configuration} from "../../models/configuration.model.js";
import {File} from "../../models/file.model.js";

import moment from 'moment';

export async function canDownload(req, res, next) {

    const clientIpAddress = req.clientIp;
    const today = moment().startOf('day').toDate();
    const config = await Configuration.findOne({
        startDate: {$lte: today},
        endDate: {$gte: today}
    });

    const maxDownloadsPerIp = config.maxDownloadsPerIp;
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


export async function canUpload(req, res, next) {

    const clientIpAddress = req.clientIp;
    const today = moment().startOf('day').toDate();

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const config = await Configuration.findOne({
        startDate: {$lte: today},
        endDate: {$gte: today}
    });

    const maxUploadsPerIp = config.maxUploadsPerIp;
    console.log('maxUploadsPerIp:', maxUploadsPerIp);
    console.log('clientIpAddress:', clientIpAddress);

    let uploadHistory = await File.find({ipAddress: clientIpAddress, createdAt: {$gte: startDate, $lt: endDate}});
    console.log('uploadHistory:', uploadHistory)

    if (!uploadHistory || uploadHistory.length < maxUploadsPerIp) {
        return next()
    } else {
        return res.status(401).send({successStatus: false, errorMessage: 'Upload limit excited'});
    }
}

export default canDownload;