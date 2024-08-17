// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import axios from 'axios';
import { Request } from 'express';
import httpStatus from 'http-status';
import config from '../config/config';
import logController from '../controllers/log.controller';
import { RequestMethod } from '../routes/v1/central.route';
import redisService from './redis.service';

export interface IURLInAPIPool {
	url: string;
}

export interface IAPIPool {
	urls: IURLInAPIPool[];
	currentURLIndex: number;
}

const defaultAPIPool: IAPIPool = {
	urls:
		config.initialAPIPoolURLS?.split(',').map((url: string) => {
			return {
				url: url.trim(),
			};
		}) ?? [],
	currentURLIndex: 0,
};

/**
 * Initializes The API Pool In Redis To The Default API Pool Defined With Environment Variables
 * @returns {Promise<void>}
 */
const initializeAPIPoolInRedis = async () => {
	try {
		const apiPoolInRedis = await redisService.getAPIPoolFromRedis();

		if (!apiPoolInRedis) await redisService.setAPIPoolInRedis(defaultAPIPool);
	} catch {}
};

initializeAPIPoolInRedis();

const something = 0;

/**
 * Returns Current API Pool From Redis, On Failure Returns null
 * @returns {Promise<IAPIPool>}
 */
const getAPIPool = async (): Promise<IAPIPool | null> => {
	try {
		return await redisService.getAPIPoolFromRedis();
	} catch {
		return defaultAPIPool;
	}
};

/**
 * Adds URL In Arg To urls Array In Redis & Returns Updated URLs, On Failure Returns null And URL May Not Be Added To Redis
 * @param {url}
 * @returns {Promise<string[] | null>}
 */
const addURLToAPIPool = async (url: string): Promise<string[] | null> => {
	try {
		return await redisService.addURLToAPIPoolInRedis(url);
	} catch {
		return null;
	}
};

/**
 * Removes URL In Arg From urls Array In Redis & Returns Updated URLs, On Failure Returns null And URL May Not Be Removed From Redis
 * @param {url}
 * @returns {Promise<string[] | null>}
 */
const removeURLFromAPIPool = async (url: string): Promise<string[] | null> => {
	try {
		return await redisService.removeURLFromAPIPoolInRedis(url);
	} catch {
		return null;
	}
};

/**
 * Replaces All URLs In urls Array In Redis With URLs In Arg & Returns Updated URLs, On Failure Returns null And URLs May Not Be Replaced In Redis
 * @param {urls}
 * @returns {Promise<string[] | null>}
 */
const replaceURLsFromAPIPool = async (
	urls: string[]
): Promise<string[] | null> => {
	try {
		return await redisService.replaceURLsFromAPIPoolInRedis(urls);
	} catch {
		return null;
	}
};

/**
 * Returns All URLs In urls Array In Redis, On Failure Returns null
 * @param urls
 * @returns {Promise<string[] | null>}
 */
const getAPIPoolURLs = async (): Promise<string[] | null> => {
	try {
		return await redisService.getURLsFromAPIPoolInRedis();
	} catch {}

	return null;
};

/**
 * Returns Index Of Current URL From Redis, On Failure Returns 0
 * @param {urls}
 * @returns {Promise<number>}
 */
const getCurrentURLIndex = async (): Promise<number> => {
	try {
		return await redisService.getCurrentURLIndexFromAPIPoolInRedis();
	} catch {
		return 0;
	}
};

const cleanupURL = (url?: string) => {
	if (url && typeof url == 'string')
		return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
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
	if (!urls?.length || attempts >= urls.length) {
		throw new Error(
			`None Of The APIs In This API Pool Are Healthy: ${JSON.stringify(urls)}`
		);
	}

	if (urlIndex >= urls?.length) {
		urlIndex = 0;
	}

	const currentURL = urls[urlIndex];

	const nextCurrentURLIndex = urlIndex >= urls.length - 1 ? 0 : urlIndex + 1;

	const url = currentURL.url;

	try {
		const isAPIHealthy = await checkAPIHealth(url);

		if (!isAPIHealthy) {
			throw new Error('Current API Is Not Healthy');
		}

		return url;
	} catch {
		return getCurrentURL({
			urls,
			urlIndex: nextCurrentURLIndex,
			attempts: attempts + 1,
		});
	}
};

const getTargetURL = async (originalURL?: string): Promise<string> => {
	const { urls, currentURLIndex } =
		await redisService.getValuesFromAPIPoolInRedis();

	const currentURL = await getCurrentURL({
		urls,
		urlIndex: currentURLIndex,
	});

	if (typeof currentURL == 'string')
		return `${cleanupURL(currentURL)}${originalURL}`;

	throw new Error('There Is No Available URL.');
};

export interface IRequestToCurrentAPI {
	requestMethod?: RequestMethod;
	requestBody?: any;
	originalURL?: string;
	headers?: any;
	requestQuery?: any;
}

/**
 * Call Request Method With Request Body To Current URL With Original URL
 * @param {IRequestToCurrentAPI}
 * @returns {Promise<any>}
 */
const requestMethodToTargetURL = async (req: Request): Promise<any> => {
	if (req.method && req.originalUrl) {
		let targetURL: string | undefined;

		try {
			targetURL = await getTargetURL(req.originalUrl);
		} catch (error) {
			const defaultMessage = `Error Getting Target URL: ${targetURL}`;

			await logController.logAnything({
				status: 'ERROR',
				title: 'Error Making Request From Load Balancer',
				message: error ? error?.message : defaultMessage,
				data: req.body,
				url: req.originalUrl,
			});

			return {
				status: httpStatus.INTERNAL_SERVER_ERROR,
				data: error?.message ?? defaultMessage,
			};
		}

		if (!targetURL) {
			throw new Error('No Target URL Found');
		}

		return await axios[req.method.toLowerCase()](targetURL, req.body);
	}

	throw new Error('Request Details Missing.');
};

export default {
	requestMethodToTargetURL,
	getAPIPool,
	getCurrentURLIndex,
	getAPIPoolURLs,
	addURLToAPIPool,
	removeURLFromAPIPool,
	replaceURLsFromAPIPool,
	checkAPIHealth,
};
