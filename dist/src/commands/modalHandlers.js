"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const assert_never_1 = __importDefault(require("assert-never"));
const registerUserAndRating_1 = require("../operations/registerUserAndRating");
const joinRoom_1 = require("../operations/joinRoom");
const rules_1 = require("../rules");
const inspectors_1 = require("../inspectors");
const buttons_1 = require("./helpers/buttons");
const tks_1 = require("./tks");
const handlers = new Map();
const withDataHandlers = new Map();
const execute = async (interaction) => {
    const { customId } = interaction;
    console.log('Modal command customId:', customId);
    console.log('user:', interaction.user);
    const handler = handlers.get(customId);
    if (handler) {
        await handler.execute(interaction);
    }
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
    customId: 'modal-dash',
    execute: async (interaction) => {
        const countStr = interaction.fields.getTextInputValue('countInput');
        const count = Math.min(Math.max(Math.trunc(Number(countStr)) || 0, 0), 100);
        await interaction.reply(`Dash! ⊂${'二'.repeat(count)}（ ＾ω＾）${'二'.repeat(count)}⊃`);
    },
};
const createRegisterAndJoinModalHandler = (rule) => {
    return {
        customId: `modal-register-and-join-${rule}`,
        execute: async (interaction) => {
            const { guildId, guild, channelId } = interaction;
            if (!channelId) {
                console.log(`guildId not found. interaction: ${interaction.toJSON()}`);
                await interaction.reply('channelId が存在しません。管理者にご連絡ください。');
                return;
            }
            if (!guildId) {
                console.log(`guildId not found. interaction: ${interaction.toJSON()}`);
                await interaction.reply('guildId が存在しません。管理者にご連絡ください。');
                return;
            }
            const gachipowerStr = interaction.fields.getTextInputValue('gachipowerInput');
            const gachipower = Math.trunc(Number(gachipowerStr)) || 0;
            if (gachipower < 600 || 3200 < gachipower) {
                await interaction.reply('gachipower には 600 から 3200 までの値を入力してください');
                return;
            }
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
            // join room
            const joinResult = await (0, joinRoom_1.joinRoom)(id, channelId, guildId);
            if (joinResult.error) {
                if (joinResult.error === 'ROOM_DOES_NOT_EXIST') {
                    messages.push('このチャンネルに募集中のゲームは現在ありません。');
                }
                else if (joinResult.error === 'USER_ALREADY_JOINED') {
                    messages.push(`${username} さんはすでに参加しています。`);
                }
                else if (joinResult.error === 'TOO_MANY_JOINED_USERS') {
                    messages.push('このチャンネルのゲームは定員を超えています。');
                }
                else if (joinResult.error === 'RATING_DOES_NOT_EXIST') {
                    messages.push('(さっき登録されたはずなのになぜか)レーティングが登録されていません。');
                }
                else {
                    (0, assert_never_1.default)(joinResult);
                }
                await interaction.reply(messages.join('\n'));
                return;
            }
            const remainMinUsersCount = Math.max(joinResult.remainMinUsersCount, 0);
            const { remainMaxUsersCount } = joinResult;
            messages.push(`${username} さんがゲームに参加しました。 (${(0, inspectors_1.inspectRating)(result.rating.mu)})\n@${remainMinUsersCount}~${remainMaxUsersCount}`);
            const components = [];
            if (remainMinUsersCount === 0)
                components.push((0, buttons_1.createMatchButton)());
            if (remainMaxUsersCount !== 0)
                components.push((0, buttons_1.createJoinButton)());
            await interaction.reply({ content: messages.join('\n'), components });
        },
    };
};
const registerAndJoinModalHandlers = rules_1.SPLAT_RULES_NAME_MAP.map(({ code }) => createRegisterAndJoinModalHandler(code));
[...registerAndJoinModalHandlers, dashHandler, tks_1.tksRecruitModalHandler].forEach((handler) => handlers.set(handler.customId, handler));
[tks_1.tksSetTeamNameModalHandler, tks_1.tksFindOpponentModalHandler, tks_1.tksReportModalHandler].forEach((handler) => withDataHandlers.set(handler.customId, handler));
//# sourceMappingURL=modalHandlers.js.map