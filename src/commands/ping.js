const { SlashCommandBuilder } = require("discord.js");

/** @type {import('commandkit').CommandData} */
const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pong!");


/** @param {import('commandkit').SlashCommandProps} param0 */
function run({ interaction, client }) {
    interaction.reply({content: `:ping_pong: Pong! ${client.ws.ping}ms`, ephemeral: true});
}

/** @type {import('commandkit').CommandOptions} */
const options = {
    devOnly: true,
};

module.exports = { data, run, options };