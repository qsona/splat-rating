"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const handler = {
    commandName: 'sr-ping',
    execute: async (interaction) => {
        const rowDash = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('dash').setLabel('Dash!').setStyle(discord_js_1.ButtonStyle.Danger));
        const rowJump = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('jump').setLabel('Jump!').setStyle(discord_js_1.ButtonStyle.Primary));
        const message = `Pong! User: ${interaction.user.username} Server info: ${interaction.guild?.name} ${interaction.guild?.id}`;
        await interaction.reply({ content: message, components: [rowDash, rowJump] });
    },
};
exports.default = handler;
//# sourceMappingURL=ping.js.map