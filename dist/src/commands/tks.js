"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tksReportModalHandler = exports.tksReportButtonHandler = exports.tksMatchButtonHandler = exports.tksFindOpponentModalHandler = exports.tksFindOpponentButtonHandler = exports.tksBreakPartyButtonHandler = exports.tksPartyHandler = exports.tksBreakRoomButtonHandler = exports.tksLeaveRoomButtonHandler = exports.tksSetTeamNameModalHandler = exports.tksSetTeamNameButtonHandler = exports.tksRoomJoinButtonHandler = exports.tksRecruitModalHandler = exports.tksRecruitHandler = exports.createTksReportModal = exports.createTksReportButton = exports.createTksFindOpponentModal = exports.createTksSetTeamNameModal = exports.createTksBreakPartyButton = exports.createTksMatchButton = exports.createTksFindOpponentButton = exports.createTksSetTeamNameButton = exports.createTksRoomJoinButton = exports.createTksBreakRoomButton = exports.createTksLeaveRoomButton = exports.createTksRecruitModal = exports.calcTeamId = void 0;
const discord_js_1 = require("discord.js");
const prismaClient_1 = require("../prismaClient");
const object_hash_1 = __importDefault(require("object-hash"));
const mentionable_1 = require("./helpers/mentionable");
const lodash_1 = require("lodash");
const rules_1 = require("../rules");
const calcTeamId = (userIds) => {
    return (0, object_hash_1.default)(userIds, { unorderedArrays: true });
};
exports.calcTeamId = calcTeamId;
const recruitingChannelId = '1043582923644874784';
const findingOpponentChannelId = '1043583020457807982';
// button and modals
const createTksRecruitModal = () => {
    const modal = new discord_js_1.ModalBuilder().setCustomId(`modal-tks-recruit`).setTitle('対抗戦味方募集');
    const input = new discord_js_1.TextInputBuilder()
        .setCustomId('description')
        .setLabel('募集の説明 (自分のパワー目安、持ちブキ、希望するパワー目安、開始時間など)') // length must be <45
        .setRequired(false)
        .setStyle(discord_js_1.TextInputStyle.Paragraph);
    const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(input);
    modal.addComponents(firstActionRow);
    return modal;
};
exports.createTksRecruitModal = createTksRecruitModal;
const createTksLeaveRoomButton = (tksRecruitingRoomId) => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(`button-tks-leave-room@${tksRecruitingRoomId}`).setLabel('抜ける').setStyle(discord_js_1.ButtonStyle.Secondary));
};
exports.createTksLeaveRoomButton = createTksLeaveRoomButton;
const createTksBreakRoomButton = (tksRecruitingRoomId) => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(`button-tks-break-room@${tksRecruitingRoomId}`).setLabel('解散').setStyle(discord_js_1.ButtonStyle.Danger));
};
exports.createTksBreakRoomButton = createTksBreakRoomButton;
const createTksRoomJoinButton = (tksRecruitingRoomId) => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(`button-tks-room-join@${tksRecruitingRoomId}`).setLabel('参加').setStyle(discord_js_1.ButtonStyle.Primary));
};
exports.createTksRoomJoinButton = createTksRoomJoinButton;
const createTksSetTeamNameButton = (teamId) => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(`button-tks-set-team-name@${teamId}`).setLabel('チーム名設定/変更').setStyle(discord_js_1.ButtonStyle.Secondary));
};
exports.createTksSetTeamNameButton = createTksSetTeamNameButton;
const createTksFindOpponentButton = (partyId) => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(`button-tks-find-opponent@${partyId}`).setLabel('相手募集').setStyle(discord_js_1.ButtonStyle.Primary));
};
exports.createTksFindOpponentButton = createTksFindOpponentButton;
const createTksMatchButton = (targetPartyId) => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(`button-tks-match@${targetPartyId}`).setLabel('このパーティーと対戦').setStyle(discord_js_1.ButtonStyle.Primary));
};
exports.createTksMatchButton = createTksMatchButton;
const createTksBreakPartyButton = (teamId) => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(`button-tks-break-party@${teamId}`).setLabel('パーティー解散').setStyle(discord_js_1.ButtonStyle.Danger));
};
exports.createTksBreakPartyButton = createTksBreakPartyButton;
const createTksSetTeamNameModal = (teamId, isUpdating) => {
    const modal = new discord_js_1.ModalBuilder().setCustomId(`modal-tks-set-team-name@${teamId}`).setTitle(isUpdating ? 'チーム名変更' : 'チーム名登録');
    const input = new discord_js_1.TextInputBuilder().setCustomId('teamNameInput').setLabel('チーム名').setRequired(true).setStyle(discord_js_1.TextInputStyle.Short);
    const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(input);
    modal.addComponents(firstActionRow);
    return modal;
};
exports.createTksSetTeamNameModal = createTksSetTeamNameModal;
const createTksFindOpponentModal = (partyId) => {
    const modal = new discord_js_1.ModalBuilder().setCustomId(`modal-tks-find-opponent@${partyId}`).setTitle('対抗戦相手募集');
    const winCountOfMatchInput = new discord_js_1.TextInputBuilder().setCustomId('winCountOfMatch').setLabel('N本先取(整数)').setRequired(true).setStyle(discord_js_1.TextInputStyle.Short);
    const descriptionInput = new discord_js_1.TextInputBuilder()
        .setCustomId('description')
        .setLabel('募集の説明 (パーティーのウデマエ/パワー目安、対戦相手への希望、開始時間など)')
        .setRequired(false)
        .setStyle(discord_js_1.TextInputStyle.Paragraph);
    const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(winCountOfMatchInput);
    const secondActionRow = new discord_js_1.ActionRowBuilder().addComponents(descriptionInput);
    modal.addComponents(firstActionRow, secondActionRow);
    return modal;
};
exports.createTksFindOpponentModal = createTksFindOpponentModal;
const createTksReportButton = (matchId) => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(`button-tks-report@${matchId}`).setLabel('結果報告').setStyle(discord_js_1.ButtonStyle.Primary));
};
exports.createTksReportButton = createTksReportButton;
const createTksReportModal = (matchId) => {
    const modal = new discord_js_1.ModalBuilder().setCustomId(`modal-tks-report@${matchId}`).setTitle('対抗戦結果報告');
    const primaryWinCountInput = new discord_js_1.TextInputBuilder()
        .setCustomId('primaryWinCount')
        .setLabel('アルファチーム勝利数')
        .setRequired(true)
        .setStyle(discord_js_1.TextInputStyle.Short);
    const opponentWinCountInput = new discord_js_1.TextInputBuilder()
        .setCustomId('opponentWinCount')
        .setLabel('ブラボーチーム勝利数')
        .setRequired(true)
        .setStyle(discord_js_1.TextInputStyle.Short);
    const isInterruptedInput = new discord_js_1.TextInputBuilder()
        .setCustomId('isInterrupted')
        .setLabel('中断フラグ (中断した場合は1を入力してください)')
        .setRequired(false)
        .setStyle(discord_js_1.TextInputStyle.Short);
    const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(primaryWinCountInput);
    const secondActionRow = new discord_js_1.ActionRowBuilder().addComponents(opponentWinCountInput);
    const thirdRow = new discord_js_1.ActionRowBuilder().addComponents(isInterruptedInput);
    modal.addComponents(firstActionRow, secondActionRow, thirdRow);
    return modal;
};
exports.createTksReportModal = createTksReportModal;
// handlers
exports.tksRecruitHandler = {
    commandName: 'tks-recruit',
    execute: async (interaction) => {
        const { id, username } = interaction.user;
        const isAlreadyRecruiting = await prismaClient_1.prisma.tksRecruitingRoomUser.findUnique({ where: { userId: id } });
        if (isAlreadyRecruiting) {
            await interaction.reply(`${username} はすでに対抗戦味方募集中です。`);
            return;
        }
        await interaction.showModal((0, exports.createTksRecruitModal)());
    },
};
exports.tksRecruitModalHandler = {
    customId: 'modal-tks-recruit',
    execute: async (interaction) => {
        const { id, username } = interaction.user;
        const isAlreadyRecruiting = await prismaClient_1.prisma.tksRecruitingRoomUser.findUnique({ where: { userId: id } });
        if (isAlreadyRecruiting) {
            await interaction.reply(`${username} はすでに対抗戦味方募集中です。`);
            return;
        }
        const description = interaction.fields.getTextInputValue('description') || null;
        const { tksRecruitingRoom } = await prismaClient_1.prisma.$transaction(async (prisma) => {
            await prisma.user.upsert({ where: { id }, update: {}, create: { id, name: username } });
            const tksRecruitingRoom = await prisma.tksRecruitingRoom.create({
                data: {
                    creatorUserId: id,
                    description,
                },
            });
            await prisma.tksRecruitingRoomUser.create({ data: { userId: id, recruitingRoomId: tksRecruitingRoom.id } });
            return { tksRecruitingRoom };
        });
        const messages = ['@everyone', `${username}: 対抗戦味方募集@3`];
        if (description)
            messages.push(description);
        await interaction.reply({
            content: messages.join('\n'),
            components: [(0, exports.createTksRoomJoinButton)(tksRecruitingRoom.id), (0, exports.createTksBreakRoomButton)(tksRecruitingRoom.id)],
        });
    },
};
exports.tksRoomJoinButtonHandler = {
    customId: 'button-tks-room-join',
    execute: async (interaction, tksRecruitingRoomId) => {
        const { id, username } = interaction.user;
        const room = await prismaClient_1.prisma.tksRecruitingRoom.findUnique({
            where: { id: tksRecruitingRoomId },
            include: { recruitingRoomUsers: { include: { user: true } } },
        });
        if (!room) {
            await interaction.reply('その募集はすでに解散しています。');
            return;
        }
        if (room.recruitingRoomUsers.some((ru) => ru.userId === id)) {
            await interaction.reply('すでに参加しています。');
            return;
        }
        const users = room.recruitingRoomUsers.map((ru) => ru.user);
        if (users.length >= 4) {
            throw new Error(`bug: room is already full ${room.id}`);
        }
        if (users.length < 3) {
            await prismaClient_1.prisma.tksRecruitingRoomUser.create({ data: { recruitingRoomId: room.id, userId: id } });
            const messages = [`${username} が参加しました。`, `@everyone 対抗戦味方募集@${3 - users.length}`];
            if (room.description)
                messages.push(room.description);
            await interaction.reply({
                content: messages.join('\n'),
                components: [(0, exports.createTksRoomJoinButton)(tksRecruitingRoomId), (0, exports.createTksLeaveRoomButton)(tksRecruitingRoomId)],
            });
            return;
        }
        // go to next stage!
        const userIds = [...users.map((user) => user.id), id];
        const usernames = [...users.map((user) => user.name), username];
        const teamId = (0, exports.calcTeamId)(userIds);
        const { team, party } = await prismaClient_1.prisma.$transaction(async (prisma) => {
            const team = await prisma.tksTeam.upsert({
                where: { id: teamId },
                update: {},
                create: {
                    id: teamId,
                    tksTeamUsers: {
                        create: userIds.map((userId) => ({
                            userId,
                        })),
                    },
                },
            });
            const party = await prisma.tksParty.create({ data: { teamId } });
            await prisma.tksRecruitingRoom.delete({ where: { id: room.id } });
            return { team, party };
        });
        const teamNameMessage = team.name ? `チーム名: ${team.name}` : `メンバー: ${usernames.join(' ')}`;
        const message = [
            `${username} が参加しました。`,
            `対抗戦味方募集@うまり`,
            teamNameMessage,
            `メンバーは<#${findingOpponentChannelId}> に移動してください 🚀`,
        ].join('\n');
        await interaction.reply({ content: message });
        const channel = interaction.guild?.channels.cache.get(findingOpponentChannelId);
        const nextMessages = [`${usernames.join(' ')} がパーティーを結成したぞ!`];
        if (team.name) {
            nextMessages.push(`チーム名: ${team.name}`);
        }
        const components = [
            (0, exports.createTksFindOpponentButton)(party.id),
            // createTksMatchButton(teamId),
            (0, exports.createTksSetTeamNameButton)(teamId),
            (0, exports.createTksBreakPartyButton)(teamId),
        ];
        // なぜか型ついてない
        await channel.send({ content: nextMessages.join('\n'), components });
    },
};
exports.tksSetTeamNameButtonHandler = {
    customId: 'button-tks-set-team-name',
    execute: async (interaction, tksTeamId) => {
        const team = await prismaClient_1.prisma.tksTeam.findUnique({ where: { id: tksTeamId } });
        if (!team) {
            await interaction.reply('チームがありません。');
            return;
        }
        await interaction.showModal((0, exports.createTksSetTeamNameModal)(tksTeamId, team.name != null));
    },
};
exports.tksSetTeamNameModalHandler = {
    customId: 'modal-tks-set-team-name',
    execute: async (interaction, tksTeamId) => {
        const teamName = interaction.fields.getTextInputValue('teamNameInput');
        const team = await prismaClient_1.prisma.tksTeam.findUnique({ where: { id: tksTeamId } });
        if (!team) {
            await interaction.reply('チームがありません。');
            return;
        }
        await prismaClient_1.prisma.tksTeam.update({ where: { id: tksTeamId }, data: { name: teamName } });
        await interaction.reply({
            content: `チーム名を${team.name == null ? '登録' : '変更'}しました: ${teamName}`,
        });
    },
};
exports.tksLeaveRoomButtonHandler = {
    customId: 'button-tks-leave-room',
    execute: async (interaction, tksRecruitingRoomId) => {
        const { user } = interaction;
        const room = await prismaClient_1.prisma.tksRecruitingRoom.findUnique({
            where: { id: tksRecruitingRoomId },
            include: { recruitingRoomUsers: true },
        });
        if (!room) {
            await interaction.reply('その募集はすでに解散しています。');
            return;
        }
        const roomUser = room.recruitingRoomUsers.find((ru) => ru.userId === user.id);
        if (!roomUser) {
            await interaction.reply(`${user.username} はこの募集に参加していません。`);
            return;
        }
        await prismaClient_1.prisma.tksRecruitingRoomUser.delete({ where: { id: roomUser.id } });
        await interaction.reply(`${user.username} が募集から抜けました。`);
    },
};
exports.tksBreakRoomButtonHandler = {
    customId: 'button-tks-break-room',
    execute: async (interaction, tksRecruitingRoomId) => {
        const { user } = interaction;
        const room = await prismaClient_1.prisma.tksRecruitingRoom.findUnique({ where: { id: tksRecruitingRoomId } });
        if (!room) {
            await interaction.reply('その募集はすでに解散しています。');
            return;
        }
        if (room.creatorUserId !== user.id) {
            await interaction.reply(`${user.username} はこの募集のホストではありません。`);
            return;
        }
        await prismaClient_1.prisma.tksRecruitingRoom.delete({ where: { id: tksRecruitingRoomId } });
        await interaction.reply('募集を解散しました。');
    },
};
exports.tksPartyHandler = {
    commandName: 'tks-party',
    execute: async (interaction) => {
        const { user, channelId } = interaction;
        const mentionable2 = interaction.options.getMentionable('user2');
        const user2 = (0, mentionable_1.getUserFromMentionable)(mentionable2);
        const mentionable3 = interaction.options.getMentionable('user3');
        const user3 = (0, mentionable_1.getUserFromMentionable)(mentionable3);
        const mentionable4 = interaction.options.getMentionable('user4');
        const user4 = (0, mentionable_1.getUserFromMentionable)(mentionable4);
        const users = [user, user2, user3, user4];
        const userIds = users.map((user) => user.id);
        if ((0, lodash_1.uniq)(userIds).length !== 4) {
            await interaction.reply('同一のユーザーが含まれています。');
            return;
        }
        for (const { id, username } of users) {
            await prismaClient_1.prisma.user.upsert({ where: { id }, update: {}, create: { id, name: username } });
        }
        const usernames = users.map((user) => user.username);
        const teamId = (0, exports.calcTeamId)(userIds);
        const { team, party } = await prismaClient_1.prisma.$transaction(async (prisma) => {
            const team = await prisma.tksTeam.upsert({
                where: { id: teamId },
                update: {},
                create: {
                    id: teamId,
                    tksTeamUsers: {
                        create: userIds.map((userId) => ({
                            userId,
                        })),
                    },
                },
            });
            const party = await prisma.tksParty.create({ data: { teamId } });
            return { team, party };
        });
        const nextMessages = [`${usernames.join(' ')} がパーティーを結成したぞ!`];
        if (team.name) {
            nextMessages.push(`チーム名: ${team.name}`);
        }
        const components = [
            (0, exports.createTksFindOpponentButton)(party.id),
            // createTksMatchButton(teamId),
            (0, exports.createTksSetTeamNameButton)(teamId),
            (0, exports.createTksBreakPartyButton)(teamId),
        ];
        if (channelId === findingOpponentChannelId) {
            await interaction.reply({ content: nextMessages.join('\n'), components });
        }
        else {
            const firstMessages = [...nextMessages, `メンバーは<#${findingOpponentChannelId}> に移動してください 🚀`];
            await interaction.reply({ content: firstMessages.join('\n') });
            const channel = interaction.guild?.channels.cache.get(findingOpponentChannelId);
            // なぜか型ついてない
            await channel.send({ content: nextMessages.join('\n'), components });
        }
    },
};
exports.tksBreakPartyButtonHandler = {
    customId: 'button-tks-break-party',
    execute: async (interaction, teamId) => {
        const party = await prismaClient_1.prisma.tksParty.findUnique({ where: { teamId } });
        if (!party) {
            await interaction.reply('パーティーがありません。');
            return;
        }
        await prismaClient_1.prisma.tksParty.delete({ where: { teamId } });
        await interaction.reply('パーティーを解散しました。');
        return;
    },
};
exports.tksFindOpponentButtonHandler = {
    customId: 'button-tks-find-opponent',
    execute: async (interaction, partyId) => {
        const party = await prismaClient_1.prisma.tksParty.findUnique({ where: { id: partyId } });
        if (!party) {
            await interaction.reply('パーティーがありません。');
            return;
        }
        const findingOpponent = await prismaClient_1.prisma.tksFindingOpponent.findUnique({ where: { partyId } });
        if (findingOpponent) {
            await interaction.reply('すでに対戦相手を募集中です。');
            return;
        }
        // TODO: check if user is in party
        await interaction.showModal((0, exports.createTksFindOpponentModal)(partyId));
    },
};
exports.tksFindOpponentModalHandler = {
    customId: 'modal-tks-find-opponent',
    execute: async (interaction, partyId) => {
        const party = await prismaClient_1.prisma.tksParty.findUnique({
            where: { id: partyId },
            include: { team: { include: { tksTeamUsers: { include: { user: true } } } } },
        });
        if (!party) {
            await interaction.reply('パーティーがありません。');
            return;
        }
        const findingOpponent = await prismaClient_1.prisma.tksFindingOpponent.findUnique({ where: { partyId } });
        if (findingOpponent) {
            await interaction.reply('すでに対戦相手を募集中です。');
            return;
        }
        const winCountOfMatchStr = interaction.fields.getTextInputValue('winCountOfMatch');
        const winCountOfMatch = Math.trunc(Number(winCountOfMatchStr));
        if (Number.isNaN(winCountOfMatch) || winCountOfMatch <= 0 || 10 < winCountOfMatch) {
            await interaction.reply('N本先取の値が不正です。');
        }
        const description = interaction.fields.getTextInputValue('description') || null;
        const rule = 'SplatZones';
        await prismaClient_1.prisma.tksFindingOpponent.create({
            data: {
                partyId,
                rule,
                winCountOfMatch,
                description,
            },
        });
        const { team } = party;
        const teamNameMessage = team.name ? `チーム名: ${team.name}` : `メンバー: ${team.tksTeamUsers.map((u) => u.user.name).join(' ')}`;
        const messages = ['対抗戦相手募集', teamNameMessage, `ルール: ${(0, rules_1.getRuleName)(rule)} ${winCountOfMatch}本先取`, description || ''];
        await interaction.reply({ content: messages.join('\n'), components: [(0, exports.createTksMatchButton)(partyId)] });
        return;
    },
};
exports.tksMatchButtonHandler = {
    customId: 'button-tks-match',
    execute: async (interaction, targetPartyId) => {
        const { user } = interaction;
        const findingOpponent = await prismaClient_1.prisma.tksFindingOpponent.findUnique({
            where: { partyId: targetPartyId },
            include: { party: { include: { team: { include: { tksTeamUsers: { include: { user: true } } } } } } },
        });
        if (!findingOpponent) {
            await interaction.reply('そのパーティーは対戦相手を募集していないか、解散しています');
            return;
        }
        const targetParty = findingOpponent.party;
        const parties = await prismaClient_1.prisma.tksParty.findMany({
            include: { team: { include: { tksTeamUsers: { include: { user: true } } } } },
        });
        const myParty = parties.find((party) => {
            return party.team.tksTeamUsers.some((tu) => tu.userId === user.id);
        });
        if (!myParty) {
            await interaction.reply(`${user.username} はパーティーを結成していません。\n/tks-party で結成するか、/tks-recruit で味方募集してください。`);
            return;
        }
        if (myParty.id === targetPartyId) {
            await interaction.reply('自分のパーティーとは対戦できません。');
            return;
        }
        const { rule, winCountOfMatch } = findingOpponent;
        const { match } = await prismaClient_1.prisma.$transaction(async (prisma) => {
            await prisma.tksParty.delete({ where: { id: targetParty.id } });
            await prisma.tksParty.delete({ where: { id: myParty.id } });
            const match = await prisma.tksMatch.create({
                data: {
                    primaryTeamId: targetParty.teamId,
                    opponentTeamId: myParty.teamId,
                    winCountOfMatch,
                    rule,
                },
            });
            return { match };
        });
        const alphaTeam = targetParty.team;
        const bravoTeam = myParty.team;
        const messages = [
            '対抗戦開始 🚀',
            `アルファ: [チーム名: ${alphaTeam.name || '(未定)'}] ${alphaTeam.tksTeamUsers.map((tu) => tu.user.name).join(' ')}`,
            `ブラボー: [チーム名: ${bravoTeam.name || '(未定)'}] ${bravoTeam.tksTeamUsers.map((tu) => tu.user.name).join(' ')}`,
            '',
            '結果報告はアルファチームが行ってください 💪',
        ];
        const components = [(0, exports.createTksReportButton)(match.id)];
        await interaction.reply({ content: messages.join('\n'), components });
    },
};
exports.tksReportButtonHandler = {
    customId: 'button-tks-report',
    execute: async (interaction, matchId) => {
        const { user } = interaction;
        const match = await prismaClient_1.prisma.tksMatch.findUnique({
            where: { id: matchId },
            include: { primaryTeam: { include: { tksTeamUsers: true } } },
        });
        if (!match) {
            await interaction.reply('対抗戦が存在しません。');
            return;
        }
        if (!match.primaryTeam.tksTeamUsers.some((tu) => tu.userId === user.id)) {
            await interaction.reply('報告はアルファチームのメンバーが行ってください。');
            return;
        }
        await interaction.showModal((0, exports.createTksReportModal)(matchId));
    },
};
exports.tksReportModalHandler = {
    customId: 'modal-tks-report',
    execute: async (interaction, matchId) => {
        const { user } = interaction;
        const match = await prismaClient_1.prisma.tksMatch.findUnique({
            where: { id: matchId },
            include: {
                primaryTeam: { include: { tksTeamUsers: { include: { user: true } } } },
                opponentTeam: { include: { tksTeamUsers: { include: { user: true } } } },
            },
        });
        if (!match) {
            await interaction.reply('対抗戦が存在しません。');
            return;
        }
        if (!match.primaryTeam.tksTeamUsers.some((tu) => tu.userId === user.id)) {
            await interaction.reply('報告はアルファチームのメンバーが行ってください。');
            return;
        }
        const primaryWinCountStr = interaction.fields.getTextInputValue('primaryWinCount');
        const primaryWinCount = Math.trunc(Number(primaryWinCountStr));
        const opponentWinCountStr = interaction.fields.getTextInputValue('opponentWinCount');
        const opponentWinCount = Math.trunc(Number(opponentWinCountStr));
        const isInterruptedStr = interaction.fields.getTextInputValue('isInterrupted');
        const isInterrupted = isInterruptedStr === '1';
        if (primaryWinCount < 0 || opponentWinCount < 0) {
            await interaction.reply('勝利数が不正です。');
            return;
        }
        if (primaryWinCount > match.winCountOfMatch || opponentWinCount > match.winCountOfMatch) {
            await interaction.reply(`${match.winCountOfMatch} 本先取の値より大きい勝利数は登録できません。`);
            return;
        }
        if (primaryWinCount === match.winCountOfMatch && opponentWinCount === match.winCountOfMatch) {
            await interaction.reply(`${match.winCountOfMatch} 本先取の値に両チームが到達することはできません。`);
            return;
        }
        if (!isInterrupted && primaryWinCount !== match.winCountOfMatch && opponentWinCount !== match.winCountOfMatch) {
            await interaction.reply(`${match.winCountOfMatch} 本先取の値に両チームとも到達していません。この入力が正しい場合、中断フラグに1を入力してください。`);
            return;
        }
        const { primaryTeamId, opponentTeamId, winCountOfMatch, rule } = match;
        await prismaClient_1.prisma.$transaction(async (prisma) => {
            await prisma.tksMatch.delete({ where: { id: matchId } });
            await prisma.tksMatchResult.create({
                data: {
                    primaryTeamId,
                    opponentTeamId,
                    winCountOfMatch,
                    primaryWinCount,
                    opponentWinCount,
                    matchStartedAt: match.createdAt,
                    rule,
                },
            });
        });
        const { primaryTeam, opponentTeam } = match;
        const messages = [
            `アルファ: [チーム名: ${primaryTeam.name || '(未定)'}] ${primaryTeam.tksTeamUsers.map((tu) => tu.user.name).join(' ')}`,
            `ブラボー: [チーム名: ${opponentTeam.name || '(未定)'}] ${opponentTeam.tksTeamUsers.map((tu) => tu.user.name).join(' ')}`,
            '',
            `結果: アルファ ${primaryWinCount} - ${opponentWinCount} ブラボー 💡`,
        ];
        interaction.reply({ content: messages.join('\n') });
    },
};
//# sourceMappingURL=tks.js.map