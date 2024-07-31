export const getLastTime = (url: any) => {
	return url.lastTime;
};

export const getEnoughTime = (url: any) => {
	return url.enoughTime;
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
