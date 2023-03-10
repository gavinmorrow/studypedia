const jwt = require("jsonwebtoken");
const generateAccessToken = require("./generateAccessToken");
const generateRefreshToken = require("./generateRefreshToken");

// Each refresh token is only valid for one use
// And whenever an old token is used, the entire family of tokens is invalidated
// Each family is represented by a UUID

/** @type {Set<string>} Raw refresh tokens (JWTs) */
let usedTokens = new Set();

/** @type {Set<string>} UUIDs */
let invalidFamilies = new Set();

/**
 * Refreshes an access token.
 * @param {string} refreshToken The refresh token to use.
 * @returns {{accessToken: string, refreshToken: string}?} The new access and refresh tokens. If the refresh token is invalid, null is returned.
 */
const refreshTokens = async refreshToken => {
	// Verify the refresh token
	let id, family;
	try {
		const token = jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET
		);

		id = token.id;
		family = token.family;

		if (id == null || family == null) {
			console.error("Invalid refresh token:", token);
			return null;
		}
	} catch (err) {
		if (!(err instanceof jwt.JsonWebTokenError)) {
			throw err;
		}

		return null;
	}

	// Check if the refresh token family has been invalidated
	if (invalidFamilies.has(family)) {
		console.error("Invalided refresh token.");
		return null;
	}

	// If the token has been used before, invalidate the entire family
	if (usedTokens.has(refreshToken)) {
		invalidFamilies.add(family);
		console.error("Invalided refresh token.");
		return null;
	}

	// Invalidate the old refresh token
	usedTokens.add(refreshToken);

	// Generate a new access token
	const accessToken = generateAccessToken(id);

	// Generate a new refresh token
	const newRefreshToken = generateRefreshToken(id, family);

	// Return the new access token and refresh token
	return { accessToken, refreshToken: newRefreshToken };
};

module.exports = refreshTokens;
