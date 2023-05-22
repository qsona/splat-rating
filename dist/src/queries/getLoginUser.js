"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoginUser = void 0;
const prismaClient_1 = require("../prismaClient");
const getLoginUser = async (req) => {
    const profile = req.user;
    if (profile === undefined || profile === null) {
        throw new Error('login user not found in request');
    }
    const loginUser = await prismaClient_1.prisma.user.findUnique({
        where: { id: profile.id },
    });
    return loginUser;
};
exports.getLoginUser = getLoginUser;
//# sourceMappingURL=getLoginUser.js.map