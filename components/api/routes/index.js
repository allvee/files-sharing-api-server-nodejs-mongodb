import express from 'express';
import configurationRoutes from './configuration.routes.js'
import fileRoutes from './file.routes.js'

const routes = express.Router();

routes.use('/', fileRoutes);
routes.use('/configurations', configurationRoutes);

export default routes;
