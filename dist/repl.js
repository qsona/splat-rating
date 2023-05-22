"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Repl = __importStar(require("repl"));
const prismaClient_1 = require("./src/prismaClient");
const registerUserAndRating_1 = require("./src/operations/registerUserAndRating");
const createRoom_1 = require("./src/operations/createRoom");
const joinRoom_1 = require("./src/operations/joinRoom");
const leaveRoom_1 = require("./src/operations/leaveRoom");
const breakRoom_1 = require("./src/operations/breakRoom");
const createMatching_1 = require("./src/operations/createMatching");
const reportMatching_1 = require("./src/operations/reportMatching");
const cancelMatching_1 = require("./src/operations/cancelMatching");
const season_1 = require("./src/models/season");
const resetRating_1 = require("./src/operations/resetRating");
// Print the welcome message
console.log(`
  Hello, ${process.env.USER}!
  You're running the Node.js REPL in ${process.cwd()}.
`);
// Start the REPL
const repl = Repl.start();
repl.context.prisma = prismaClient_1.prisma;
Object.entries({
    registerUserAndRating: registerUserAndRating_1.registerUserAndRating,
    createRoom: createRoom_1.createRoom,
    joinRoom: joinRoom_1.joinRoom,
    leaveRoom: leaveRoom_1.leaveRoom,
    breakRoom: breakRoom_1.breakRoom,
    createMatching: createMatching_1.createMatching,
    reportMatching: reportMatching_1.reportMatching,
    cancelMatching: cancelMatching_1.cancelMatching,
    getCurrentSeason: season_1.getCurrentSeason,
    resetSigmaAllInGuild: resetRating_1.resetSigmaAllInGuild,
    resetRating: resetRating_1.resetRating,
}).forEach(([k, v]) => {
    repl.context[k] = v;
});
//# sourceMappingURL=repl.js.map