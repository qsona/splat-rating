"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromMentionable = void 0;
const getUserFromMentionable = (mentionable) => {
    if (!mentionable) {
        return null;
    }
    if (mentionable.hasOwnProperty('username')) {
        return mentionable;
    }
    if (mentionable.hasOwnProperty('user')) {
        return mentionable.user;
    }
    return null;
};
exports.getUserFromMentionable = getUserFromMentionable;
//# sourceMappingURL=mentionable.js.map