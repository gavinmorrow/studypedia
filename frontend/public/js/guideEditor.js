const guideId = document.querySelector("meta[name='data-guide-id']").content;

// Handle messages from the server
const handleMessage = msg => {
	switch (msg.type) {
		case "ping":
			socket.send(JSON.stringify({ type: "pong" }));
			break;

		case "error":
			console.error("Error from the server:", msg);
			break;

		default:
			console.error("Invalid message type", msg.type);
	}
};

// Connect to the server with websockets
const socket = new WebSocket(`ws://localhost:8080/guide/${guideId}`);

socket.addEventListener("open", () => {
	console.log("Connected to the server");
});

socket.addEventListener("error", err => {
	console.error("Error from the server:", err);
});

socket.addEventListener("close", () => {
	console.log("Disconnected from the server");
});

socket.addEventListener("message", msg => {
	console.log("Message from the server:", msg);

	try {
		msg = JSON.parse(msg.data);
	} catch (err) {
		console.error("Invalid message format. Message must be JSON.", msg);
		return;
	}

	handleMessage(msg);
});

// Handle user input
for (const textarea of document.querySelectorAll("main textarea")) {
	textarea.addEventListener("input", () => {
		socket.send(
			JSON.stringify({
				type: "updateParagraph",
				data: {
					newValue: textarea.value,
				},
			})
		);
	});

	textarea.addEventListener("beforeinput", e => {
		// Check to see if paragraph should be deleted
		if (textarea.value !== "") return;
		if (e.inputType === "deleteContentBackward") {
			socket.send(JSON.stringify({ type: "deleteParagraph" }));

			// Lock the previous paragraph, if possible
			const prev = textarea.parentElement.previousElementSibling.querySelector("textarea");
				
		}
	});
}
