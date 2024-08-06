// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import docsRoute from './docs.route';
import centralRoute from './central.route';
import config from '../../config/config';
import logRoute from './log.route';
import emailRoute from './email.route';

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
	{
		path: '/log',
		route: logRoute,
	},
	{ path: '/email', route: emailRoute },
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
