const rateLimit = require("express-rate-limit");

// Load environment variables (fallback to defaults if not set)
const RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = process.env.RATE_LIMIT_MAX_REQUESTS || 100; // Max requests per window

const limiter = rateLimit({
	windowMs: Number(RATE_LIMIT_WINDOW_MS),
	max: Number(RATE_LIMIT_MAX_REQUESTS),
	message: {
		success: false,
		error: "Too many requests",
		message:
			"You have exceeded the allowed request limit. Please try again later.",
	},
	handler: (req, res) => {
		console.warn(`Rate limit exceeded for IP: ${req.ip}`);
		res.status(429).json({
			success: false,
			error: "Too many requests",
			message:
				"You have exceeded the allowed request limit. Please try again later.",
		});
	},
	headers: true, // Adds rate limit headers to the response
});

module.exports = limiter;
