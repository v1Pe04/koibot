const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

/** @type {import('commandkit').CommandData} */
const data = new SlashCommandBuilder()
    .setName("gap")
    .setDescription("Get information about how big the gap is between the clan above and below, as well as top 50");


/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({ interaction, client }) {
    interaction.reply({content: "This command is not yet implemented.", ephemeral: true});
}

/** @type {import('commandkit').CommandOptions} */
const options = {
    devOnly: false,
    userPermissions: ["ManageGuild"]
};

module.exports = { data, run, options };