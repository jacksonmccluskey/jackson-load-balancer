// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

export const getLastTime = (apiPool: any) => {
	return apiPool.lastUpdate;
};

export const getEnoughTime = (apiPool: any) => {
	return apiPool.enoughTime;
};

export const hasBeenEnoughTime = (url: any) => {
	const now = new Date();

	const lastTime = getLastTime(url);

	const enoughTime = getEnoughTime(url);

	if (!lastTime || now <= lastTime) {
		return true;
	}

	const isTimeDifferenceEnough =
		now.getTime() - lastTime.getTime() >= enoughTime;

	if (!isTimeDifferenceEnough) {
		return false;
	}

	return true;
};
