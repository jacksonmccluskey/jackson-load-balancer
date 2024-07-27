/**
 * Check API Health
 * @param {string} url
 * @returns {boolean}
 */
export const checkAPIHealth = (url: string): boolean => {
	if (url) {
		return true;
	}

	return false;
};

export default {
	checkAPIHealth,
};
