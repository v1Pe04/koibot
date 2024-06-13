const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

/** @type {import('commandkit').CommandData} */
const data = new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Check if kick is available or how long until it is available.");


/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({ interaction, client }) {
    const response = await client.db.clan_response.findFirst();
    const kickTimestamp = response.response.data.LastKickTimestamp;
    const oneDayAgo = Math.floor((Date.now() - 86400000) / 1000);
    
    if(kickTimestamp - oneDayAgo <= 0) {
        interaction.reply({content: "Kick is available!", ephemeral: true});
        console.log(`${interaction.user.username} used /kick | Kick is available!`);
        return;
    } else {
        interaction.reply({content: `Kick is not available. Next kick will be available <t:${kickTimestamp + 86400}:R> / <t:${kickTimestamp + 86400}:f>`, ephemeral: true});
        console.log(`${interaction.user.username} used /kick | Kick is not available!`);
        return;
    }

}

/** @type {import('commandkit').CommandOptions} */
const options = {
    devOnly: false,
    userPermissions: ["ManageGuild"]
};

module.exports = { data, run, options };