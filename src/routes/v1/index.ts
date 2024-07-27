import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import docsRoute from './docs.route';
import centralRoute from './central.route';
import config from '../../config/config';

export const router = express.Router();

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
		path: '/central',
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
if (config.env === 'DEVELOPMENT') {
	devRoutes.forEach((route) => {
		router.use(route.path, route.route);
	});
}

export default router;
