import '../../../config/env.config.js';

const env = process.env;
import {Configuration} from "../../models/configuration.model.js";


export const addConfigurationData = async (req, res) => {
    let response = {}
    response.successStatus = false;

    try {
        let {maxDownloadsPerIp, inactivityLimit, startDate, endDate} = req.body;

        if (!startDate) {
            startDate = new Date();
        }
        if (!endDate) {
            const date = new Date();
            endDate = date.setFullYear(date.getFullYear() + 1);
        }

        // Check if there is an existing entry between the given dates
        const existingEntry = await Configuration.findOne({
            startDate: {$lte: endDate},
            endDate: {$gte: startDate}
        });

        if (existingEntry) {
            response.existingData = existingEntry
            response.errorMessage = 'An entry already exists between the specified dates';
            return res.status(500).json(response);
        }
        if (!maxDownloadsPerIp) {
            maxDownloadsPerIp = (env.MAX_DOWNLOAD_LIMIT_PER_IP_PER_DAY || 5)
        }
        if (!inactivityLimit) {
            inactivityLimit = (env.INACTIVITY_LIMIT_ID_DAYS || 7)
        }
        const configurationData = {
            maxDownloadsPerIp: maxDownloadsPerIp,
            inactivityLimit: (inactivityLimit),
            startDate: (startDate || Date.now),
            endDate: (endDate || Date.now)
        };
        const configuration = new Configuration(configurationData);
        let addedData = await configuration.save();
        console.log('Configuration data added successfully');

        response.data = addedData;
        response.successStatus = true;
        return res.status(200).json(response);
    } catch (err) {
        console.error(err);
        response.errorMessage = err.message
        return res.status(500).json(response);
    }
};

export const getConfigurations = async (req, res) => {
    let response = {};
    response.successStatus = false;

    try {
        const ConfigurationData = await Configuration.find();
        console.log('ConfigurationData:', ConfigurationData)

        if (!ConfigurationData || ConfigurationData.length === 0) {

            response.errorMessage = 'No configuration data found';
            return res.status(404).send(response);
        }
        response.data = ConfigurationData;
        response.successStatus = true;
        return res.status(200).send(response);
    } catch (err) {
        console.log(err);
        response.errorMessage = err.message
        return res.status(500).send(response);
    }
};

