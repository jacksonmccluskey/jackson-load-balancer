// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import axios from 'axios';
import httpStatus from 'http-status';
import config from '../config/config';
import logController from '../controllers/log.controller';
import { RequestMethod } from '../routes/v1/central.route';

const apiPool = {
	urls: config.initialAPIPoolURLS.split(',').map((url: string) => {
		return {
			url: url,
			isHealthy: false,
		};
	}),
	currentURLIndex: 0,
};

const cleanupURL = (url?: string) => {
	if (url && typeof url == 'string') {
		return url.charAt(url.length - 1) == '/'
			? url.substring(0, url.length - 1)
			: url;
	}
};

/**
 * Check API Health
 * @param {string} url
 * @returns {boolean}
 */
const checkAPIHealth = async (url?: string): Promise<boolean> => {
	if (!url) {
		return false;
	}

	try {
		const healthCheck = await axios.get(
			`${cleanupURL(url)}${config.initialAPIHealthCheckRoute}`
		);

		return healthCheck.status === 200;
	} catch (error: any) {
		throw new Error(`🟥 Health Check Request Failed ${error?.message}`);
	}
};

interface IGetCurrentURL {
	urls: any[];
	urlIndex: number;
	attempts?: number;
}

/**
 * Get Current URL From Database
 * @param {IGetCurrentURL}
 * @returns {string}
 */
const getCurrentURL = async ({
	urls,
	urlIndex,
	attempts = 0,
}: IGetCurrentURL): Promise<string> => {
	if (attempts >= urls?.length) {
		throw new Error(
			`None Of The APIs In This API Pool Are Healthy: ${JSON.stringify(urls)}`
		);
	}

	if (urlIndex >= urls?.length) {
		throw new Error(
			'Current URL Index Out Of Bounds. Manual Data Intervention Is Required.'
		);
	}

	const currentURL = urls[urlIndex];

	const nextCurrentURLIndex = urlIndex >= urls.length - 1 ? 0 : urlIndex + 1;

	try {
		const isAPIHealthy = await checkAPIHealth(currentURL.url);

		if (!isAPIHealthy) {
			throw new Error('Current API Is Not Healthy');
		}

		apiPool.urls[urlIndex].isHealthy = true;
		apiPool.currentURLIndex = nextCurrentURLIndex;

		return currentURL.url;
	} catch {
		apiPool.urls[urlIndex].isHealthy = false;

		return getCurrentURL({
			urls,
			urlIndex: nextCurrentURLIndex,
			attempts: attempts + 1,
		});
	}
};

const getTargetURL = async (originalURL?: string): Promise<string> => {
	const { urls, currentURLIndex } = apiPool;

	const currentURL = await getCurrentURL({ urls, urlIndex: currentURLIndex });

	if (currentURL) return `${cleanupURL(currentURL)}${originalURL}`;

	throw new Error('There Is No Available URL.');
};

export interface IRequestToCurrentAPI {
	requestMethod?: RequestMethod;
	requestBody?: any;
	originalURL?: string;
}

/**
 * Call Request Method With Request Body To Current URL With Original URL
 * @param {IRequestToCurrentAPI}
 * @returns {Promise<any>}
 */
const requestMethodToTargetURL = async ({
	requestMethod,
	requestBody,
	originalURL,
}: IRequestToCurrentAPI): Promise<any> => {
	if (requestMethod && originalURL) {
		try {
			const targetURL = await getTargetURL(originalURL);

			return await axios[requestMethod.toLowerCase()](targetURL, requestBody);
		} catch (error: any) {
			const defaultMessage = 'Unknown Error Getting URL & Making Request';

			await logController.logAnything({
				status: 'ERROR',
				title: 'Load Balancer Error',
				message: error ? error?.message : defaultMessage,
				data: requestBody,
				url: originalURL,
			});

			return {
				status: httpStatus.INTERNAL_SERVER_ERROR,
				data: error?.message ?? defaultMessage,
			};
		}
	}

	throw new Error('Request Details Missing.');
};

export default requestMethodToTargetURL;
