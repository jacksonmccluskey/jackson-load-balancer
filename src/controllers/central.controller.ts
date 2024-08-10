// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import { RequestMethod } from '../routes/v1/central.route';
import catchAsync from '../utils/catch-async';
import services from '../services';
import { Request, Response } from 'express';
import { IRequestToCurrentAPI } from '../services/central.service';
import httpStatus from 'http-status';
import logger from '../config/logger';

const handleAPIPoolRequest = async (
	requestInfo: IRequestToCurrentAPI,
	res: Response
) => {
	try {
		switch (requestInfo.requestMethod) {
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
				const removeURL = requestInfo.requestBody.url;

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
				const addURL = requestInfo.requestBody.url;

				if (typeof addURL != 'string') {
					throw new Error('Invalid New URL To Add');
				}

				const apiURLs = await services.centralService.addURLToAPIPool(addURL);

				res.status(httpStatus.OK).send(apiURLs);

				return;
			}
			case 'PUT': {
				const newURLs = requestInfo.requestBody.urls;

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

const destructureRequestInfo = (req: Request): IRequestToCurrentAPI => {
	const getRequestMethod = () => {
		if (['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
			return req.method as RequestMethod;
		}

		throw new Error('The Given Request Method Is Not Supported');
	};

	return {
		requestBody: req.body,
		originalURL: req.originalUrl,
		requestMethod: getRequestMethod(),
	};
};

const controller = catchAsync(async (req: Request, res: Response) => {
	try {
		const requestInfo = destructureRequestInfo(req);

		if (requestInfo.originalURL.includes('jackson-health-check')) {
			return res.status(200).send('Jackson Is Very Healthy 🍎');
		}

		if (requestInfo.originalURL.includes('jackson-api-pool')) {
			return await handleAPIPoolRequest(requestInfo, res);
		}

		const apiResponse = await services.centralService.requestMethodToTargetURL(
			requestInfo
		);

		const status = apiResponse?.status || httpStatus.INTERNAL_SERVER_ERROR;
		const headers = apiResponse?.headers || {};
		const data = apiResponse?.data;

		return res.status(status).set(headers).send(data);
	} catch (error) {
		await logger.logAnything({});

		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(error?.message ? error.message : 'Load Balancer Failure');
	}
});

export default controller;
