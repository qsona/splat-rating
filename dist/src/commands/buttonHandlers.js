"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const discord_js_1 = require("discord.js");
const join_1 = require("./join");
const report_1 = require("./report");
const match_1 = require("./match");
const tks_1 = require("./tks");
const handlers = new Map();
const withDataHandlers = new Map();
const execute = async (interaction) => {
    const { customId } = interaction;
    console.log('Button command customId:', customId);
    console.log('user:', interaction.user);
    const handler = handlers.get(customId);
    if (handler) {
        await handler.execute(interaction);
    }
    // customId@data
    const result = customId.match(/(.+?)@(.+)/);
    if (result) {
        const handler = withDataHandlers.get(result[1]);
        if (handler) {
            await handler.execute(interaction, result[2]);
        }
    }
    return;
};
exports.execute = execute;
const dashHandler = {
    customId: 'dash',
    execute: async (interaction) => {
        const modal = new discord_js_1.ModalBuilder().setCustomId('modal-dash').setTitle('Dash!');
        const countInput = new discord_js_1.TextInputBuilder().setCustomId('countInput').setLabel('count?').setStyle(discord_js_1.TextInputStyle.Short);
        const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(countInput);
        modal.addComponents(firstActionRow);
        await interaction.showModal(modal);
    },
};
const jumpHandler = {
    customId: 'jump',
    execute: async (interaction) => {
        const rowDash = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('dash').setLabel('Dash!').setStyle(discord_js_1.ButtonStyle.Danger));
        await interaction.reply({ content: '???????Jump', components: [rowDash] });
    },
};
[join_1.joinButtonHandler, report_1.reportWinButtonHandler, report_1.reportLoseButtonHandler, report_1.reportCancelButtonHandler, match_1.matchButtonHandler, dashHandler, jumpHandler].forEach((handler) => handlers.set(handler.customId, handler));
[
    tks_1.tksRoomJoinButtonHandler,
    tks_1.tksLeaveRoomButtonHandler,
    tks_1.tksBreakRoomButtonHandler,
    tks_1.tksSetTeamNameButtonHandler,
    tks_1.tksBreakPartyButtonHandler,
    tks_1.tksFindOpponentButtonHandler,
    tks_1.tksMatchButtonHandler,
    tks_1.tksReportButtonHandler,
].forEach((handler) => withDataHandlers.set(handler.customId, handler));
//# sourceMappingURL=buttonHandlers.js.map