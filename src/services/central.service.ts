import axios, { AxiosResponse } from 'axios';
import models from '../models';
import config from '../config/config';
import { hasBeenEnoughTime } from '../utils/has-been-enough-time';
import { RequestMethod } from '../routes/v1/central.route';
import logger from '../config/logger';

/**
 * Check API Health
 * @param {string} url
 * @returns {boolean}
 */
const checkAPIHealth = async (url?: string): Promise<boolean> => {
	if (url) {
		try {
			const healthCheckURL = `${url}${config.initialAPIHealthCheckRoute}`;

			const healthCheck = await axios.get(healthCheckURL);

			return healthCheck.status === 200;
		} catch {}
	}

	return false;
};

interface IGetCurrentURL {
	name?: string;
	attempts?: number;
}

/**
 * Get Current URL From Database
 * @param {IGetCurrentURL}
 * @returns {string}
 */
const getCurrentURL = async ({
	name = config.initialAPIPoolName,
	attempts = 0,
}: IGetCurrentURL): Promise<string> => {
	const apiPool = await models.APIPool.findOne({
		name,
	});

	if (!apiPool) {
		throw new Error('The Requested API Pool Does Not Exist');
	}

	const { currentURLIndex, urls } = apiPool;

	if (attempts > urls.length) {
		// TODO: Save Request Body To CloudWatch Logs
		throw new Error('None Of The APIs In This API Pool Are Healthy');
	}

	if (currentURLIndex >= urls?.length) {
		throw new Error(
			'Current URL Index Out Of Bounds. Manual Data Intervention Is Required.'
		);
	}

	const currentURL = urls[currentURLIndex];

	const nextCurrentURLIndex =
		currentURLIndex >= urls.length - 1 ? 0 : currentURLIndex + 1;

	const isAPIHealthy = await checkAPIHealth(currentURL.url);

	if (!isAPIHealthy) {
		await models.APIPool.updateOne(
			{ 'urls._id': currentURL._id },
			{
				$set: {
					[`urls.${currentURLIndex}`]: {
						isHealthy: false,
						lastTime: new Date(),
						url: currentURL.url,
					},
					currentURLIndex: nextCurrentURLIndex,
				},
			}
		);

		return getCurrentURL({ name, attempts: attempts + 1 });
	}

	await models.APIPool.updateOne(
		{ 'urls._id': currentURL._id },
		{
			$set: {
				[`urls.${currentURLIndex}`]: {
					isHealthy: true,
					url: currentURL.url,
					lastTime: currentURL.lastTime,
				},
				currentURLIndex: nextCurrentURLIndex,
			},
		}
	);

	return currentURL.url;
};

const getTargetURL = async (apiPoolName: string, originalURL: string) => {
	const currentURL = await getCurrentURL({ name: apiPoolName });

	if (currentURL.charAt(currentURL.length - 1) == '/') {
		return `${currentURL.substring(0, currentURL.length - 1)}${originalURL}`;
	}

	if (originalURL.charAt(originalURL.length - 1) != '/') {
		return `${currentURL}/${originalURL}`;
	}

	const targetURL = `${currentURL}${originalURL}`;

	return targetURL;
};

interface IRequestToCurrentAPI {
	apiPoolName?: string;
	requestBody?: any;
	originalURL?: string;
}

/**
 * Post Data To Current API
 * @param {IRequestToCurrentAPI}
 * @returns {Promise<any>}
 */
const postService = async ({
	apiPoolName,
	requestBody,
	originalURL,
}: IRequestToCurrentAPI): Promise<AxiosResponse<any, any>> => {
	const targetURL = await getTargetURL(apiPoolName, originalURL);

	return await axios.post(targetURL, requestBody);
};

/**
 * Get Data From Current API
 * @param {IRequestToCurrentAPI}
 * @returns {Promise<any>}
 */
const getService = async ({
	apiPoolName,
	requestBody,
	originalURL,
}: IRequestToCurrentAPI): Promise<AxiosResponse<any, any>> => {
	const targetURL = await getTargetURL(apiPoolName, originalURL);

	logger.info(`Making GET Request To ${targetURL}`);

	const getResponse = await axios.get(targetURL, requestBody);

	return getResponse;
};

/**
 * Update Data Through Current API
 * @param {IRequestToCurrentAPI}
 * @returns {Promise<any>}
 */
const updateService = async ({
	apiPoolName,
	requestBody,
	originalURL,
}: IRequestToCurrentAPI): Promise<AxiosResponse<any, any>> => {
	const targetURL = await getTargetURL(apiPoolName, originalURL);

	logger.info(`Making PUT Request To ${targetURL}`);

	return await axios.put(targetURL, requestBody);
};

/**
 * Delete Data With Current API
 * @param {IRequestToCurrentAPI}
 * @returns {Promise<any>}
 */
const deleteService = async ({
	apiPoolName,
	requestBody,
	originalURL,
}: IRequestToCurrentAPI): Promise<AxiosResponse<any, any>> => {
	const targetURL = await getTargetURL(apiPoolName, originalURL);

	logger.info(`Making DELETE Request To ${targetURL}`);

	return await axios.delete(targetURL, requestBody);
};

export const centralServices: {
	[keys in RequestMethod]: ({
		apiPoolName,
		requestBody,
	}: IRequestToCurrentAPI) => Promise<AxiosResponse<any, any>>;
} = {
	POST: postService,
	GET: getService,
	PUT: updateService,
	DELETE: deleteService,
};

export default centralServices;
