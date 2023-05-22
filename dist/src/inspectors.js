"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectTeamUsers = exports.inspectRating = void 0;
const lodash_1 = require("lodash");
const inspectRating = (mu) => `R${Math.floor(mu)}`;
exports.inspectRating = inspectRating;
const inspectTeamUsers = (teamUsers) => {
    //  const usersStr = teamUsers.map((ru) => `${ru.username} (R${ru.mu})`).join(' ')
    const usersStr = teamUsers.map((ru) => ru.username).join(' ');
    const ratingStr = `合計${(0, exports.inspectRating)((0, lodash_1.sumBy)(teamUsers, (ru) => ru.mu))} (${teamUsers.map((tu) => (0, exports.inspectRating)(tu.mu)).join(', ')})`;
    return `${usersStr} | ${ratingStr}`;
};
exports.inspectTeamUsers = inspectTeamUsers;
//# sourceMappingURL=inspectors.js.map