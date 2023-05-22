"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCancelButton = exports.createLoseButton = exports.createWinButton = exports.createMatchButton = exports.createJoinButton = void 0;
const discord_js_1 = require("discord.js");
const createJoinButton = () => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('button-join').setLabel('参加').setStyle(discord_js_1.ButtonStyle.Primary));
};
exports.createJoinButton = createJoinButton;
const createMatchButton = () => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('button-match').setLabel('チーム分け').setStyle(discord_js_1.ButtonStyle.Primary));
};
exports.createMatchButton = createMatchButton;
const createWinButton = () => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('button-report-win').setLabel('Win!').setStyle(discord_js_1.ButtonStyle.Danger));
};
exports.createWinButton = createWinButton;
const createLoseButton = () => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('button-report-lose').setLabel('Lose...').setStyle(discord_js_1.ButtonStyle.Success));
};
exports.createLoseButton = createLoseButton;
const createCancelButton = () => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('button-report-cancel').setLabel('Cancel').setStyle(discord_js_1.ButtonStyle.Secondary));
};
exports.createCancelButton = createCancelButton;
//# sourceMappingURL=buttons.js.map