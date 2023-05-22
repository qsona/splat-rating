"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const prismaClient_1 = require("./src/prismaClient");
const rules_1 = require("./src/rules");
const passport_discord_1 = require("passport-discord");
const prisma_session_store_1 = require("@quixo3/prisma-session-store");
require('dotenv').config();
const express_session_1 = __importDefault(require("express-session"));
const client_1 = require("@prisma/client");
const getLoginUser_1 = require("./src/queries/getLoginUser");
const getRatings_1 = require("./src/queries/getRatings");
const getPowerGraphData_1 = require("./src/queries/getPowerGraphData");
const getRankingData_1 = require("./src/queries/getRankingData");
const lodash_1 = require("lodash");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const ADMIN_IDS = ['535814780787884073', '928994301373976607'];
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET_KEY || 'a',
    name: 'session',
    resave: false,
    saveUninitialized: true,
    store: new prisma_session_store_1.PrismaSessionStore(new client_1.PrismaClient(), {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
    })
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user) {
        next();
    }
    else {
        res.redirect('/login');
    }
};
const isAdmin = (req) => {
    return ADMIN_IDS.indexOf(req.user.id) !== -1;
};
app.set('view engine', 'ejs');
app.use('/assets', express_1.default.static(__dirname + '/assets'));
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});
app.get('/test', isAuthenticated, (req, res) => {
    res.render('test');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});
app.get('/dashboard', isAuthenticated, async (req, res) => {
    const loginUser = await (0, getLoginUser_1.getLoginUser)(req);
    if (!loginUser) {
        return res.status(404).send('User Not Found');
    }
    const ratings = await (0, getRatings_1.getRatings)(loginUser);
    const powerGraphData = await (0, getPowerGraphData_1.getPowerGraphData)(loginUser);
    res.render('dashboard', { loginUser, user: loginUser, isAdmin: isAdmin(req), ratings, powerGraphData, rules: rules_1.SPLAT_RULES_NAME_MAP });
});
app.get('/profile', isAuthenticated, async (req, res) => {
    const loginUser = await (0, getLoginUser_1.getLoginUser)(req);
    if (!loginUser) {
        return res.status(404).send('User Not Found');
    }
    res.render('profile', { loginUser, user: loginUser, isAdmin: isAdmin(req) });
});
app.post('/profile', isAuthenticated, async (req, res) => {
    const profile = req.user;
    const loginUser = await (0, getLoginUser_1.getLoginUser)(req);
    if (!loginUser) {
        return res.status(404).send('User Not Found');
    }
    const newName = req.body.name;
    // TODO: do validate & csrf token check
    const result = await prismaClient_1.prisma.user.update({
        where: {
            id: profile.id,
        },
        data: {
            name: newName,
        },
    });
    if (result.name !== newName) {
        return res.status(500).send('User Data update failed...');
    }
    res.redirect('/profile');
});
// TODO: showCount, pageId
app.get('/history', isAuthenticated, async (req, res) => {
    const loginUser = await (0, getLoginUser_1.getLoginUser)(req);
    if (!loginUser) {
        return res.status(404).send('User Not Found');
    }
    const ratings = await prismaClient_1.prisma.gameResultRating.findMany({
        where: { userId: loginUser.id },
        orderBy: { createdAt: 'desc' },
        include: { gameResult: true },
    });
    res.render('history', { loginUser, isAdmin: isAdmin(req), ratings, rules: rules_1.SPLAT_RULES_NAME_MAP });
});
app.get('/ranking', isAuthenticated, async (req, res) => {
    const loginUser = await (0, getLoginUser_1.getLoginUser)(req);
    if (!loginUser) {
        return res.status(404).send('User Not Found');
    }
    const rankingData = await (0, getRankingData_1.getRankingData)(loginUser);
    res.render('ranking', { loginUser, user: loginUser, isAdmin: isAdmin(req), rankingData, rules: rules_1.SPLAT_RULES_NAME_MAP });
});
app.get('/admin/users', isAuthenticated, async (req, res) => {
    if (!isAdmin(req)) {
        return res.redirect('/dashboard');
    }
    const loginUser = await (0, getLoginUser_1.getLoginUser)(req);
    if (!loginUser) {
        return res.status(404).send('User Not Found');
    }
    const users = await prismaClient_1.prisma.user.findMany();
    res.render('admin/users', { loginUser, users, isAdmin: isAdmin(req) });
});
app.get('/admin/user/:id', isAuthenticated, async (req, res) => {
    if (!isAdmin(req)) {
        return res.redirect('/dashboard');
    }
    const loginUser = await (0, getLoginUser_1.getLoginUser)(req);
    if (!loginUser) {
        return res.status(404).send('User Not Found');
    }
    const user = await prismaClient_1.prisma.user.findUnique({
        where: { id: req.params.id },
    });
    if (!user) {
        return res.status(404).send('User Not Found');
    }
    const ratings = await (0, getRatings_1.getRatings)(user);
    const powerGraphData = await (0, getPowerGraphData_1.getPowerGraphData)(user);
    res.render('dashboard', { loginUser, user, isAdmin: isAdmin(req), ratings, powerGraphData, rules: rules_1.SPLAT_RULES_NAME_MAP });
});
app.get('/admin/ranking/:id', isAuthenticated, async (req, res) => {
    if (!isAdmin(req)) {
        return res.redirect('/dashboard');
    }
    const loginUser = await (0, getLoginUser_1.getLoginUser)(req);
    if (!loginUser) {
        return res.status(404).send('User Not Found');
    }
    const user = await prismaClient_1.prisma.user.findUnique({
        where: { id: req.params.id },
    });
    if (!user) {
        return res.status(404).send('User Not Found');
    }
    const rankingData = await (0, getRankingData_1.getRankingData)(user);
    res.render('ranking', { loginUser, user, isAdmin: isAdmin(req), rankingData, rules: rules_1.SPLAT_RULES_NAME_MAP });
});
app.get('/docs', async (req, res) => {
    const isLoggedIn = req.isAuthenticated();
    const result = await prismaClient_1.prisma.wiki.findFirst({});
    var content = null;
    if (!(0, lodash_1.isNull)(result)) {
        content = result.content;
    }
    res.render('docs', { isLoggedIn: isLoggedIn, content: content });
});
app.get('/docs/edit', isAuthenticated, async (req, res) => {
    const loginUser = await (0, getLoginUser_1.getLoginUser)(req);
    if (!loginUser) {
        return res.status(404).send('User Not Found');
    }
    const result = await prismaClient_1.prisma.wiki.findFirst({});
    var content = null;
    if (!(0, lodash_1.isNull)(result)) {
        content = result.content;
    }
    res.render('docs-edit', { loginUser, isAdmin: isAdmin(req), content: content });
});
app.post('/docs/edit', isAuthenticated, async (req, res) => {
    const loginUser = await (0, getLoginUser_1.getLoginUser)(req);
    if (!loginUser) {
        return res.status(404).send('User Not Found');
    }
    const content = String(req.body.content);
    // TODO: do validate & csrf token check
    const result = await prismaClient_1.prisma.wiki.create({
        data: {
            content: content,
            userId: loginUser.id
        }
    });
    res.redirect('/docs/edit');
});
const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_CALLBACK_URL } = process.env;
if (!DISCORD_CLIENT_ID)
    throw new Error('DISCORD_CLIENT_ID is not set');
if (!DISCORD_CLIENT_SECRET)
    throw new Error('DISCORD_CLIENT_SECRET is not set');
passport_1.default.use(new passport_discord_1.Strategy({
    clientID: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    callbackURL: DISCORD_CALLBACK_URL,
    scope: ['identify'],
}, async (_accessToken, _refreshToken, profile, callback) => {
    try {
        console.log([_accessToken, _refreshToken, profile]);
        let user = prismaClient_1.prisma.user.findUnique({
            where: {
                id: profile.id,
            },
        });
        if (!user) {
            user = prismaClient_1.prisma.user.create({ data: { id: profile.id, name: profile.username } });
            if (!user) {
                throw new Error('Cannot create user exception');
            }
        }
        return callback(null, profile);
    }
    catch (e) {
        return callback(e, null);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
app.get('/auth/discord', passport_1.default.authenticate('discord'));
app.get('/auth/discord/callback', passport_1.default.authenticate('discord', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
}));
app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});
// launch bot
require('./bot');
//# sourceMappingURL=app.js.map