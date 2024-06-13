const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

/** @type {import('commandkit').CommandData} */
const data = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Get info about a players stats in Pet Simulator 99.")
    .addUserOption((option) => option.setName("player").setDescription("The player to get info on.").setRequired(false));

/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({ interaction, client }) {
    let targetUser = interaction.user;

    if (interaction.options.getUser("player") != null) {
        targetUser = interaction.options.getUser("player");
    }

    if (targetUser.bot) {
        interaction.reply({ content: "This user is a bot...", ephemeral: true });
        return;
    }

    const userLink = await client.db.user_link.findFirst({
        where: {
            discord_id: targetUser.id,
        },
    });

    if (!userLink) {
        interaction.reply({ content: `User ${targetUser} is not linked to a roblox account.`, ephemeral: true });
        return;
    }

    const robloxUser = await client.db.members.findFirst({
        where: {
            user_id: userLink.user_id,
        },
    });

    if (robloxUser === null) {
        interaction.reply({ content: `User ${targetUser} is linked to a roblox account, but the account has either not been cached, or is not in the clan.`, ephemeral: true });
        return;
    }

    const response = await client.db.clan_response.findFirst();
    const clan = response.response.data;
    const keys = Object.keys(clan.Battles);
    const maxKey = keys[keys.length - 1];
    const points = clan.Battles[maxKey].PointContributions.find((obj) => obj.UserID == robloxUser.user_id)?.Points ?? 0;
    const diamonds = clan.DiamondContributions.AllTime.Data.find((obj) => obj.UserID == robloxUser.user_id)?.Diamonds ?? 0;
    const presence = presenceArray[robloxUser.presence];

    if (robloxUser === null) {
        interaction.reply({ content: `User ${targetUser} is linked to a roblox account, but the account has not been cached.`, ephemeral: true });
        return;
    }

    const InfoEmbed = new EmbedBuilder()
        .setColor(0xd9641e)
        .setTitle(`${robloxUser.username}`)
        .setURL(`https://www.roblox.com/users/${robloxUser.user_id}/profile`)
        .setAuthor({ name: presence, iconURL: `https://singlecolorimage.com/get/${presenceColorArray[robloxUser.presence]}/1x1` })
        .setThumbnail(robloxUser.avatar)
        .setDescription(`**${maxKey} stats:**\n⭐ **${formatNumber(points)}**\n💎 **${formatNumber(diamonds)}**`)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });

    interaction.reply({ embeds: [InfoEmbed], ephemeral: true });

    console.log(`${interaction.user.username} used /info | ${robloxUser.username} (${robloxUser.user_id})`);
}

/** @type {import('commandkit').CommandOptions} */
const options = {
    devOnly: false,
};

module.exports = { data, run, options };

const presenceArray = {
    0: "Offline",
    1: "On Website",
    2: "In Game",
    3: "In Studio",
};

const presenceColorArray = {
    0: "747F8D",
    1: "747F8D",
    2: "2ECC71",
    3: "3498DB",
};

function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + "B";
    }
    if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + "M";
    }
    if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + "K";
    }
    return num.toString();
}
