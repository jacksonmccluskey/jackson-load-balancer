const rateLimit = require('express-rate-limit');

export const authLimiter = rateLimit({
	windowMs: process.env.RATE_LIMITER_WINDOW_MS
		? parseInt(process.env.RATE_LIMITER_WINDOW_MS)
		: 1 * 60 * 1000,
	max: process.env.RATE_LIMITER_MAX
		? parseInt(process.env.RATE_LIMITER_MAX)
		: 60,
	skipSuccessfulRequests: true,
});
