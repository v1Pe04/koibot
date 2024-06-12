const { SlashCommandBuilder } = require("discord.js");

/** @type {import('commandkit').CommandData} */
const data = new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link a discord users to their roblox account.")
    .addSubcommand(subcommand =>
        subcommand
            .setName("add")
            .setDescription("Link your roblox account to your discord account.")
            .addIntegerOption(option =>
                option.setName("roblox_id")
                    .setDescription("Your roblox user ID.")
                    .setRequired(true)
            )
            .addMentionableOption(option =>
                option.setName("user")
                    .setDescription("The user to link.")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("remove")
            .setDescription("Remove a linked roblox account.")
            .addMentionableOption(option =>
                option.setName("user")
                    .setDescription("The user to unlink.")
                    .setRequired(true)
            )
    );


/** @param {import('commandkit').SlashCommandProps} param0 */
async function run({ interaction, client }) {
    const subcommand = interaction.options.getSubcommand();
    if(subcommand === "add") {
        const user = interaction.options.getMentionable("user");
        const userid = interaction.options.getInteger("roblox_id");

        const userLink = await client.db.user_link.findFirst({ 
            where: { 
                discord_id: user.id,
            } 
        });

        if(userLink) {
            interaction.reply({content: `User ${user} is already linked to roblox user ID ${userLink.user_id}.`, ephemeral: true});
            return;
        }

        await client.db.user_link.create({
            data: {
                discord_id: user.id,
                user_id: `${userid}`,
            }
        });
        
        interaction.reply({content: `Linked ${user} to roblox user ID ${userid}.`, ephemeral: true});

        return;
    }

    if (subcommand === "remove") {
        const user = interaction.options.getMentionable("user");

        const userLink = await client.db.user_link.findFirst({
            where: {
                discord_id: user.id,
            }
        });

        if(!userLink) {
            interaction.reply({content: `User ${user} is not linked to any roblox account.`, ephemeral: true});
            return;
        }

        await client.db.user_link.delete({
            where: {
                discord_id: user.id,
            }
        });

        interaction.reply({content: `Unlinked ${user}.`, ephemeral: true});

        return;
    }
}

/** @type {import('commandkit').CommandOptions} */
const options = {
    devOnly: true,
};

module.exports = { data, run, options };