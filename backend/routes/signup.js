const generateAccessToken = require("../authentication/generateAccessToken");
const db = require("../db/db");
const User = require("../classes/User");

const bcrypt = require("bcrypt");

// TODO: Refactor (split into multiple functions/files)

/** A route to create a new user. */
const signup = async (req, res) => {
    const { password } = req.body;

    // Ensure that the password is valid
    if (password == null) res.status(400).send("Password is required");

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds).catch(err => {
        res.sendStatus(500);
        throw err;
    });

    // Generate a random ID for the user
    /**
     * A random id for the user.
     * @type {string}
     */
    let id;

    // Ensure that the id is unique
    do {
        id = crypto.randomUUID();
    } while ((await db.users.get(id)) != null);

    // Create the user and add it to the database
    const user = new User(id, passwordHash);
    await db.users.add(user);

    // Generate a JWT token
    const token = generateAccessToken(user.id);

    // Send the token to the user
    res.send(token);
};

module.exports = signup;
