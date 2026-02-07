// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import redisService from '../services/redis.service';

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

export type EventCategory =
	| 'SUCCESS'
	| 'WARNING'
	| 'ERROR'
	| 'TERMINATED'
	| 'REDIS_DISCONNECTED'
	| 'MONGO_DISCONNECTED'
	| 'API_FAILURE';

export const enoughTimeByEvent: Record<EventCategory, number> = {
	SUCCESS: day,
	WARNING: 8 * hour,
	ERROR: hour,
	TERMINATED: 10 * minute,
	REDIS_DISCONNECTED: hour,
	MONGO_DISCONNECTED: hour,
	API_FAILURE: hour,
};

export const hasBeenEnoughTime = async (
	event: EventCategory
): Promise<boolean> => {
	return redisService.hasBeenEnoughTimeInRedis(event, enoughTimeByEvent[event]);
};
