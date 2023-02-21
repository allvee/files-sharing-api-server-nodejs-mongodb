import express from 'express';

const configuration_router = express.Router();

import {
    addConfigurationData,
    getConfigurations
} from '../configurations/controllers/configuration.controller.js';

configuration_router.post("/add", [addConfigurationData]);
configuration_router.get("/list", [getConfigurations]);

export default configuration_router;