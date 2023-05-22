"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegisterAndJoinModal = void 0;
const discord_js_1 = require("discord.js");
const rules_1 = require("../../rules");
const createRegisterAndJoinModal = (rule) => {
    const ruleName = (0, rules_1.getRuleName)(rule);
    const modal = new discord_js_1.ModalBuilder().setCustomId(`modal-register-and-join-${rule}`).setTitle(`${ruleName} レーティング登録`);
    const gachiPowerInput = new discord_js_1.TextInputBuilder().setCustomId('gachipowerInput').setLabel('ガチパワー').setRequired(true).setStyle(discord_js_1.TextInputStyle.Short);
    const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(gachiPowerInput);
    modal.addComponents(firstActionRow);
    return modal;
};
exports.createRegisterAndJoinModal = createRegisterAndJoinModal;
//# sourceMappingURL=modals.js.map