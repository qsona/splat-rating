"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuleName = exports.SPLAT_RULES_NAME_MAP = void 0;
exports.SPLAT_RULES_NAME_MAP = [
    { code: 'SplatZones', name: 'ガチエリア' },
    { code: 'TowerControl', name: 'ガチヤグラ' },
    { code: 'Rainmaker', name: 'ガチホコバトル' },
    { code: 'ClamBlitz', name: 'ガチアサリ' },
];
const getRuleName = (rule) => {
    return exports.SPLAT_RULES_NAME_MAP.find((r) => r.code === rule).name;
};
exports.getRuleName = getRuleName;
//# sourceMappingURL=rules.js.map