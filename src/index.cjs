const { Client } = require("discord.js");
const { CommandKit } = require("commandkit");
const { PrismaClient } = require("@prisma/client");
require("dotenv/config");

const prisma = new PrismaClient();

const client = new Client({
    intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent", "GuildVoiceStates", "GuildPresences"],
});
client.db = prisma;

async function main() {
    new CommandKit({
        client,
        commandsPath: `${__dirname}/commands`,
        eventsPath: `${__dirname}/events`,
        bulkRegister: true,
        devGuildIds: [process.env.DEV_SERVER],
        devUserIds: ["270188202533322763"],
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

client.login(process.env.TOKEN);
