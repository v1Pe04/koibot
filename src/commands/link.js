const { SlashCommandBuilder, ComponentType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const noblox = require("noblox.js");

/** @type {import('commandkit').CommandData} */
const data = new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link a discord users to their roblox account.")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("add")
            .setDescription("Link your roblox account to your discord account.")
            .addIntegerOption((option) => option.setName("roblox_id").setDescription("Your roblox user ID.").setRequired(true))
            .addMentionableOption((option) => option.setName("user").setDescription("The user to link.").setRequired(true))
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("remove")
            .setDescription("Remove a linked roblox account.")
            .addMentionableOption((option) => option.setName("user").setDescription("The user to unlink.").setRequired(true))
    );

/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({ interaction, client }) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "add") {
        const user = interaction.options.getMentionable("user");
        const userid = interaction.options.getInteger("roblox_id");

        const userLink = await client.db.user_link.findFirst({
            where: {
                OR: [{ discord_id: user.id }, { user_id: userid }],
            },
        });

        if (userLink) {
            interaction.reply({ content: `User ${user} is already linked to roblox user ID ${userLink.user_id}.`, ephemeral: true });
            return;
        }

        const confirm = new ButtonBuilder().setCustomId("confirm").setLabel("Yes").setStyle(ButtonStyle.Success).setEmoji("1169572290997014578");

        const cancel = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Secondary).setEmoji("1169572288992124939");

        const row = new ActionRowBuilder().addComponents(confirm, cancel);

        let userInfo = await noblox.getPlayerInfo({ userId: userid }).catch((error) => {
            console.error("Failed to get user info. " + error);
            interaction.reply({ content: "No user found with provided ID.", ephemeral: true });
            return;
        });

        const response = await interaction.reply({ content: `Are you sure you want to link ${user} to roblox user **${userInfo.username}** (ID: ${userid})?`, components: [row], ephemeral: true });

        console.log(`User ${interaction.user.username} is trying to link ${user.username} to roblox user ID ${userid}.`);

        const filter = (i) => i.user.id === interaction.user.id;

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter,
            time: 30_000,
        });

        collector.on("collect", async (profile) => {
            if (profile.customId === "confirm") {
                await client.db.user_link.create({
                    data: {
                        discord_id: user.id,
                        user_id: `${userid}`,
                    },
                });

                response.delete();

                interaction.followUp({ content: `Linked ${user} to roblox user ID ${userid}.`, ephemeral: true });

                console.log(`User ${interaction.user.username} linked ${user.username} to roblox user ID ${userid}.`);

                collector.stop();
                return;
            } else if (profile.customId === "cancel") {
                interaction.deleteReply();

                console.log(`User ${interaction.user.username} cancelled linking ${user.username} to roblox user ID ${userid}.`);

                collector.stop();
                return;
            }
        });
    }

    if (subcommand === "remove") {
        const user = interaction.options.getMentionable("user");

        const userLink = await client.db.user_link.findFirst({
            where: {
                discord_id: user.id,
            },
        });

        if (!userLink) {
            interaction.reply({ content: `User ${user} is not linked to any roblox account.`, ephemeral: true });
            return;
        }

        await client.db.user_link.delete({
            where: {
                discord_id: user.id,
            },
        });

        interaction.reply({ content: `Unlinked ${user}.`, ephemeral: true });

        console.log(`User ${interaction.user.username} unlinked ${user.name}.`);

        return;
    }
}

/** @type {import('commandkit').CommandOptions} */
const options = {
    devOnly: false,
    userPermissions: ["ManageGuild"],
};

module.exports = { data, run, options };
