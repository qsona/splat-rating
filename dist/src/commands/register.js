"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rules_1 = require("../rules");
const registerUserAndRating_1 = require("../operations/registerUserAndRating");
const handler = {
    commandName: 'sr-register',
    execute: async (interaction) => {
        const { guildId, guild } = interaction;
        if (!guildId) {
            console.log(`guildId not found. interaction: ${interaction.toJSON()}`);
            await interaction.reply('guildId が存在しません。管理者にご連絡ください。');
            return;
        }
        const gachipower = interaction.options.getNumber('gachipower');
        const rule = interaction.options.getString('rule');
        const rulename = (0, rules_1.getRuleName)(rule);
        const { id, username } = interaction.user;
        const name = username;
        // register rating
        const result = await (0, registerUserAndRating_1.registerUserAndRating)(id, username, guildId, rule, gachipower);
        if (result === 'RATING_ALREADY_REGISTERED') {
            await interaction.reply(`${guild?.name} において ユーザー ${name} の ${rulename} のレーティングはすでに登録されています。`);
            return;
        }
        const messages = [];
        if (result.isNewUser) {
            messages.push(`ユーザー ${name} が新しく登録されました。(ID: ${id})`);
        }
        messages.push(`ユーザー ${name} の ${rulename} のレーティングが登録されました。 初期値: ${gachipower}`);
        await interaction.reply(messages.join('\n'));
    },
};
exports.default = handler;
//# sourceMappingURL=register.js.map