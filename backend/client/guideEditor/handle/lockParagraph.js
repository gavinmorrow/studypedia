const logger = require("../../../logger");
const WSMessage = require("../../classes/WSMessage");
const lockParagraph = (ws, data, session) => {
	logger.trace(`Locking paragraph ${data.paragraphId} for user ${ws.userId}.`);

	if (session.locks.find(lock => lock.userId === ws.userId)) {
		logger.warn(
			"User",
			ws.userId,
			"tried to lock a paragraph while already having a lock. Ignoring."
		);
		ws.send(
			WSMessage.error("You already have a lock on a paragraph.", {
				type: "alreadyLocked",
				paragraphId: data.paragraphId,
			})
		);
		return;
	}

	session.locks.push({ userId: ws.userId, paragraphId: data.paragraphId });
};
module.exports = lockParagraph;
