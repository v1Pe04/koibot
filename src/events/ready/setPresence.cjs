const {Client, ActivityType} = require("discord.js");
const config = require("../../../config.json");

/**
 * 
 * @param {Client} client 
 */

module.exports = (client) => {
    client.user.setActivity({
        name: `PS99 | v${config.version}`,
        type: ActivityType.Playing
    });
};