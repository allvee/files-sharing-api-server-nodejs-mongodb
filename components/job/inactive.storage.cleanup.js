import fs from 'fs';
import '../config/env.config.js';

const env = process.env;

import File from "../api/models/file.model.js";
import Configuration from "../api/models/configuration.model.js";


const deleteInactiveFiles = async () => {
    try {

        console.log('----------------------- cleaning started ----------------------');

        const now = new Date();
        const configurationData = await Configuration.findOne({
            startDate: {$lte: now},
            endDate: {$gte: now},
        });

        const inactivityLimit = (configurationData.inactivityLimit || env.INACTIVITY_LIMIT_ID_DAYS);
        const cutoffDate = new Date(Date.now() - inactivityLimit * 24 * 60 * 60 * 1000); // calculate the cutoff date

        const inactiveFiles = await File.find({lastDownloadDate: {$lt: cutoffDate}});

        console.log('inactivityLimit in Days:', inactivityLimit);
        console.log('No of inactiveFiles:', inactiveFiles.length);

        for (const file of inactiveFiles) {
            fs.unlinkSync(file.filepath);
            await File.deleteOne({_id: file._id});
            console.log('deleted: ', file.filepath);
        }
    } catch (err) {
        console.error(err);
    }
    console.log('----------------------- cleaning finished ---------------------');
};

export default deleteInactiveFiles;