// TODO: Implement Redis Service For Atomic Operations, Distributed Locking, & Consistency Across Instances

import Redis from 'ioredis';
import config from '../config/config';
import { sendEmailForEvent } from '../utils/send-email-for-event';
import { IAPIPool, IURLInAPIPool } from './central.service';

let redis = new Redis({ host: '127.0.0.1', port: 6379 });

redis.on('error', async (err) => {
	try {
		await sendEmailForEvent('REDIS_DISCONNECTED', {
			to: config.email.to,
			subject: 'Redis Disconnected',
			text: `Redis Disconnected: ${err.message}`,
		});
	} catch {}
});

const luaScript = `
local currentIndex = redis.call('INCR', KEYS[1]) - 1
local urlsLength = redis.call('LLEN', KEYS[2])

if urlsLength <= 0 then
  return cjson.encode({urls = {}, currentURLIndex = 0})
end

local urlIndex = currentIndex % urlsLength

if (urlIndex + 1 >= urlsLength) then
  redis.call('SET', KEYS[1], 0)
else 
  redis.call('SET', KEYS[1], urlIndex + 1)
end

local urls = redis.call('LRANGE', KEYS[2], 0, -1)
local urlsJson = {}
for i = 1, #urls do
  urlsJson[i] = cjson.decode(urls[i])
end

local response = cjson.encode({urls = urlsJson, currentURLIndex = urlIndex})
return response
`;

const initializeAPIPoolInRedis = async () => {
	try {
		const index = await redis.get('apiPool:currentURLIndex');

		if (index === null) {
			await redis.set('apiPool:currentURLIndex', 0);
		}

		const urls = await redis.get('apiPool:urls');

		if (!urls?.length) {
			await Promise.all(
				config.initialAPIPoolURLS.split(',').map(async (url: string) => {
					await redis.rpush('apiPool:urls', JSON.stringify({ url }));
				})
			);
		}
	} catch {}
};

initializeAPIPoolInRedis();

const getAPIPoolFromRedis = async (): Promise<IAPIPool | null> => {
	try {
		const urls = await redis.lrange('apiPool:urls', 0, -1);
		const currentURLIndex = await redis.get('apiPool:currentURLIndex');

		return {
			urls: urls.map((url) => JSON.parse(url) as IURLInAPIPool),
			currentURLIndex: parseInt(currentURLIndex),
		};
	} catch {
		return null;
	}
};

const getURLsFromAPIPoolInRedis = async (): Promise<string[]> => {
	const urlsFromRedis = await redis.lrange('apiPool:urls', 0, -1);

	if (urlsFromRedis) {
		return urlsFromRedis.map((url) => JSON.parse(url));
	}
};

const getCurrentURLIndexFromAPIPoolInRedis = async (): Promise<
	number | null
> => {
	const currentURLIndex = await redis.get('apiPool:currentURLIndex');

	if (currentURLIndex != null) {
		return parseInt(currentURLIndex);
	}
};

const setAPIPoolInRedis = async (apiPool: IAPIPool): Promise<IAPIPool> => {
	await redis.del('apiPool:urls');

	await Promise.all(
		apiPool.urls.map(async (url: IURLInAPIPool) =>
			redis.rpush('apiPool:urls', JSON.stringify(url))
		)
	);

	await redis.set('apiPool:currentURLIndex', apiPool.currentURLIndex);

	return await getAPIPoolFromRedis();
};

const addURLToAPIPoolInRedis = async (url: string): Promise<string[]> => {
	await redis.rpush('apiPool:urls', JSON.stringify({ url }));

	return await getURLsFromAPIPoolInRedis();
};

const removeURLFromAPIPoolInRedis = async (url: string): Promise<string[]> => {
	const urls = await redis.lrange('apiPool:urls', 0, -1);
	const newUrls = urls.filter(
		(currentURL) => JSON.parse(currentURL).url !== url
	);

	await redis.del('apiPool:urls');
	await Promise.all(
		newUrls.map((newUrl) => redis.rpush('apiPool:urls', newUrl))
	);

	return await getURLsFromAPIPoolInRedis();
};

const replaceURLsFromAPIPoolInRedis = async (
	urls: string[]
): Promise<string[]> => {
	await redis.del('apiPool:urls');

	await Promise.all(
		urls.map((url) => redis.rpush('apiPool:urls', JSON.stringify({ url })))
	);

	return await getURLsFromAPIPoolInRedis();
};

const getValuesFromAPIPoolInRedis = async (): Promise<IAPIPool> => {
	if (redis.status == 'ready') {
		const result = await redis.eval(
			luaScript,
			2,
			'apiPool:currentURLIndex',
			'apiPool:urls'
		);

		if (!(typeof result == 'string')) {
			throw new Error('Redis Error');
		}

		const parsedResult = JSON.parse(result);

		return parsedResult;
	}

	throw new Error("Redis Isn't Connected");
};

export default {
	getAPIPoolFromRedis,
	getURLsFromAPIPoolInRedis,
	getCurrentURLIndexFromAPIPoolInRedis,
	setAPIPoolInRedis,
	addURLToAPIPoolInRedis,
	removeURLFromAPIPoolInRedis,
	replaceURLsFromAPIPoolInRedis,
	getValuesFromAPIPoolInRedis,
};
