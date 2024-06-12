const { SlashCommandBuilder } = require("discord.js");

/** @type {import('commandkit').CommandData} */
const data = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Get info about a players stats in Pet Simulator 99.")
    .addUserOption(option =>
        option.setName("player")
            .setDescription("The player to get info on.")
            .setRequired(false)
    );


/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({ interaction, client }) {
    let targetUser = interaction.user;

    if(interaction.options.getUser("player") != null) {
        targetUser = interaction.options.getUser("player");
    }

    if(targetUser.bot) {
        interaction.reply({content: "This user is a bot...", ephemeral: true});
        return;
    }

    const userLink = await client.db.user_link.findFirst({
        where: {
            discord_id: targetUser.id,
        }
    });

    if(!userLink) {
        interaction.reply({content: `User ${targetUser} is not linked to a roblox account.`, ephemeral: true});
        return;
    }

    const robloxUser = await client.db.members.findFirst({
        where: {
            user_id: userLink.user_id,
        }
    });

    const response = await client.db.clan_response.findFirst();
    const clan = response.response.data;
    const points = clan.Battles.HackerBattle.PointContributions.find(obj => obj.UserID == robloxUser.user_id);
    const diamonds = clan.DiamondContributions.AllTime.Data.find(obj => obj.UserID == robloxUser.user_id);
    const presence = presenceArray[robloxUser.presence];
    
    if(robloxUser === null) {
        interaction.reply({content: `User ${targetUser} is linked to a roblox account, but the account has not been cached.`, ephemeral: true});
        return;
    }

    interaction.reply({content: `**${robloxUser.username}**\n**Points:** ${points.Points}\n**Diamonds:** ${diamonds.Diamonds}\n**Status:** ${presence}`, ephemeral: true});
}

/** @type {import('commandkit').CommandOptions} */
const options = {
    devOnly: true,
};

module.exports = { data, run, options };

const presenceArray = {
    0: "Offline",
    1: "On Website",
    2: "In Game",
    3: "In Studio",
};