import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import docsRoute from './docs.route';
import centralRoute from './central.route';
import config from '../../config/config';

const router = express.Router();

const defaultRoutes = [
	{
		path: '/auth',
		route: authRoute,
	},
	{
		path: '/users',
		route: userRoute,
	},
	{
		path: '/api',
		route: centralRoute,
	},
];

const devRoutes = [
	{
		path: '/docs',
		route: docsRoute,
	},
];

defaultRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
	devRoutes.forEach((route) => {
		router.use(route.path, route.route);
	});
}

export default router;
