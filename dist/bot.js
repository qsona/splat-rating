"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Require the necessary discord.js classes
const discord_js_1 = require("discord.js");
const register_1 = __importDefault(require("./src/commands/register"));
const newgame_1 = __importDefault(require("./src/commands/newgame"));
const join_1 = __importDefault(require("./src/commands/join"));
const leave_1 = __importDefault(require("./src/commands/leave"));
const break_1 = __importDefault(require("./src/commands/break"));
const match_1 = __importDefault(require("./src/commands/match"));
const report_1 = __importDefault(require("./src/commands/report"));
const make_register_1 = __importDefault(require("./src/commands/make-register"));
const make_join_1 = __importDefault(require("./src/commands/make-join"));
const make_leave_1 = __importDefault(require("./src/commands/make-leave"));
const display_1 = __importDefault(require("./src/commands/display"));
const ping_1 = __importDefault(require("./src/commands/ping"));
const separate_1 = __importDefault(require("./src/commands/separate"));
const separation_reset_1 = __importDefault(require("./src/commands/separation-reset"));
const tks_1 = require("./src/commands/tks");
const buttonHandlers_1 = require("./src/commands/buttonHandlers");
const modalHandlers_1 = require("./src/commands/modalHandlers");
require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
// Create a new client instance
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});
// Login to Discord with your client's token
if (token) {
    client.login(token);
}
else {
    console.log('DISCORD_TOKEN is not set');
}
const handlers = new Map();
const helpHandler = {
    commandName: 'sr-help',
    execute: async (interaction) => {
        await interaction.reply('参加する人は /sr-register でレーティング登録をして /sr-join で参加してね! \n参考URL: https://qsona.github.io/splat-rating/');
    },
};
[
    register_1.default,
    newgame_1.default,
    join_1.default,
    leave_1.default,
    match_1.default,
    break_1.default,
    report_1.default,
    make_register_1.default,
    make_join_1.default,
    make_leave_1.default,
    display_1.default,
    ping_1.default,
    helpHandler,
    separate_1.default,
    separation_reset_1.default,
    tks_1.tksRecruitHandler,
    tks_1.tksPartyHandler,
].forEach((handler) => {
    handlers.set(handler.commandName, handler);
});
client.on('interactionCreate', async (interaction) => {
    // if (interaction.type !== InteractionType.ApplicationCommand) {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        console.log(commandName);
        console.log(interaction.user);
        const handler = handlers.get(commandName);
        if (handler) {
            await handler.execute(interaction);
        }
        return;
    }
    if (interaction.isButton()) {
        await (0, buttonHandlers_1.execute)(interaction);
        return;
    }
    if (interaction.type === discord_js_1.InteractionType.ModalSubmit) {
        await (0, modalHandlers_1.execute)(interaction);
        return;
    }
});
//# sourceMappingURL=bot.js.map