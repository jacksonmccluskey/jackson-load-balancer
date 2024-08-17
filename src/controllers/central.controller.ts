// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import catchAsync from '../utils/catch-async';
import services from '../services';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import logController from './log.controller';

const handleAPIPoolRequest = async (req: Request, res: Response) => {
	try {
		switch (req.method.toUpperCase()) {
			case 'GET': {
				const apiPool = await services.centralService.getAPIPool();

				if (!apiPool) {
					res
						.status(httpStatus.INTERNAL_SERVER_ERROR)
						.send('Could Not Get API Pool');
					return;
				}

				res.status(httpStatus.OK).send(apiPool);

				return;
			}
			case 'DELETE': {
				const removeURL = req.body.url;

				if (typeof removeURL != 'string') {
					throw new Error('Invalid URL To Remove');
				}

				const apiURLs = await services.centralService.removeURLFromAPIPool(
					removeURL
				);

				res.status(httpStatus.OK).send(apiURLs);

				return;
			}
			case 'POST': {
				const addURL = req.body.url;

				if (typeof addURL != 'string') {
					throw new Error('Invalid New URL To Add');
				}

				const apiURLs = await services.centralService.addURLToAPIPool(addURL);

				res.status(httpStatus.OK).send(apiURLs);

				return;
			}
			case 'PUT': {
				const newURLs = req.body.urls;

				if (!Array.isArray(newURLs)) {
					throw new Error('Invalid New URLs To Replace');
				}

				const apiURLs = await services.centralService.replaceURLsFromAPIPool(
					newURLs
				);

				res.status(httpStatus.OK).send(apiURLs);

				return;
			}
			default: {
				throw new Error('Invalid Request');
			}
		}
	} catch (error) {
		res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(`Unable To Reach API Pool: ${error.message}`);

		return;
	}
};

const controller = catchAsync(async (req: Request, res: Response) => {
	try {
		if (req.originalUrl.includes('jackson-health-check')) {
			return res.status(200).send('Jackson Is Very Healthy 🍎');
		}

		if (req.originalUrl.includes('jackson-api-pool')) {
			return await handleAPIPoolRequest(req, res);
		}

		const apiResponse = await services.centralService.requestMethodToTargetURL(
			req
		);

		const status = apiResponse?.status || httpStatus.INTERNAL_SERVER_ERROR;
		const data = apiResponse?.data;

		return res.status(status).send(data);
	} catch (error) {
		await logController.logAnything({
			status: 'ERROR',
			title: 'Load Balancer Failure',
			message: `Error: ${error?.message}`,
			data: req.body ? req.body : undefined,
			url: req.originalUrl ? req.originalUrl : undefined,
		});

		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(error?.message ? error.message : 'Load Balancer Failure');
	}
});

export default controller;
