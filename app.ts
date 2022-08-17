import express from 'express'
import passport from 'passport'
import { prisma } from './src/prismaClient'
import { SPLAT_RULES_NAME_MAP } from './src/rules'
import { Strategy as DiscordStrategy } from 'passport-discord'
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { Template } from './src/models/graphData'
import { Profile } from './src/models/profile'

require('dotenv').config()
import session from 'express-session'
import { PrismaClient, Rating } from '@prisma/client'
const app = express()
const port = process.env.PORT || 3000
const ADMIN_IDS = ['535814780787884073', '928994301373976607']
const SPLAT_ROOM_GUILD_ID = '853262631837630484';

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY || 'a', // TODO
    name: 'session',
    resave: false,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      new PrismaClient(), {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
)
app.use(passport.initialize())
app.use(passport.session())

const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && req.user) {
    next()
  } else {
    res.redirect('/login')
  }
}
const isAdmin = (req: any) => {
  return ADMIN_IDS.indexOf(req.user.id) !== -1
}

app.set('view engine', 'ejs')
app.use('/assets', express.static(__dirname + '/assets'))

app.get('/', (req, res) => {
  res.redirect('/dashboard')
})

app.get('/test', isAuthenticated, (req, res) => {
  res.render('test')
})

app.get('/login', (req, res) => {
  res.render('login')
})
app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})

app.get('/dashboard', isAuthenticated, async (req, res) => {
  const profile = <Profile>req.user
  const loginUser = await prisma.user.findUnique({
    where: { id: profile.id },
  })
  if (!loginUser) {
    return res.status(404).send('User Not Found')
  }
  const ratings = await prisma.rating.findMany({
    where: { userId: loginUser.id },
  })

  const gameResultRatings = await prisma.gameResultRating.findMany({
    where: { userId: loginUser.id },
    orderBy: { createdAt: 'asc' },
    include: { gameResult: true },
  })
  let rulesRatingMap = new Map()
  SPLAT_RULES_NAME_MAP.forEach(function (rule) {
    // do clone without npm clone module
    rulesRatingMap.set(rule.code, JSON.parse(JSON.stringify(Template)))
  })
  if (gameResultRatings) {
    gameResultRatings.forEach(function (gameResultRating) {
      let templateData = rulesRatingMap.get(gameResultRating.gameResult.rule)
      const formattedCreatedAt =
        gameResultRating.createdAt.getMonth() +
        1 +
        '/' +
        gameResultRating.createdAt.getDate() +
        ' ' +
        ('0' + gameResultRating.createdAt.getHours()).slice(-2) +
        ':' +
        ('0' + gameResultRating.createdAt.getMinutes()).slice(-2)
      templateData.data.labels.push(formattedCreatedAt)
      templateData.data.datasets[0].data.push(Math.floor(gameResultRating.muAfter))
    })
  }
  res.render('dashboard', { loginUser, user: loginUser, isAdmin: isAdmin(req), ratings, rulesRatingMap, rules: SPLAT_RULES_NAME_MAP })
})

app.get('/profile', isAuthenticated, async (req, res) => {
  const profile = <Profile>req.user
  const loginUser = await prisma.user.findUnique({
    where: { id: profile.id },
  })
  if (!loginUser) {
    return res.status(404).send('User Not Found')
  }
  res.render('profile', { loginUser, user: loginUser, isAdmin: isAdmin(req) })
})

app.post('/profile', isAuthenticated, async (req, res) => {
  const profile = <Profile>req.user
  const loginUser = await prisma.user.findUnique({
    where: { id: profile.id },
  })

  if (!loginUser) {
    return res.status(404).send('User Not Found')
  }

  const newName = req.body.name
  // TODO: do validate & csrf token check
  const result = await prisma.user.update({
    where: {
      id: profile.id,
    },
    data: {
      name: newName,
    },
  })
  if (result.name !== newName) {
    return res.status(500).send('User Data update failed...')
  }
  res.redirect('/profile')
})

// TODO: showCount, pageId
app.get('/history', isAuthenticated, async (req, res) => {
  const profile = <Profile>req.user
  const loginUser = await prisma.user.findUnique({
    where: { id: profile.id },
  })
  if (!loginUser) {
    return res.status(404).send('User Not Found')
  }
  const ratings = await prisma.gameResultRating.findMany({
    where: { userId: loginUser.id },
    orderBy: { createdAt: 'desc' },
    include: { gameResult: true },
  })
  res.render('history', { loginUser, isAdmin: isAdmin(req), ratings, rules: SPLAT_RULES_NAME_MAP })
})

app.get('/ranking', isAuthenticated, async (req, res) => {
  const profile = <Profile>req.user
  const loginUser = await prisma.user.findUnique({
    where: { id: profile.id },
  })
  if (!loginUser) {
    return res.status(404).send('User Not Found')
  }

  const rankingMap = new Map()

  for (var i = 0; i < SPLAT_RULES_NAME_MAP.length; i++) {
    const rule = SPLAT_RULES_NAME_MAP[i];
    const ratings = await prisma.rating.findMany({
      where: {
        guildId: SPLAT_ROOM_GUILD_ID,
        rule: rule.code
      },
      orderBy: {
        mu: 'desc'
      }
    })
    const simpleRank = ratings.findIndex((r) => r.userId === loginUser.id) + 1
    if (simpleRank !== 0) {
      let mu3SigmaRatings = ratings.map(function(value, idx, map) {
        return {
          userId: value.userId,
          score: value.mu - (3 * value.sigma)
        }
      })
      mu3SigmaRatings.sort(function (a, b) {
        // sort by score desc
        if (a.score < b.score) {
          return 1
        }
        if (b.score < a.score) {
          return -1
        }
        return 0
      })
      const mu3SigmaRank = mu3SigmaRatings.findIndex((r) => r.userId === loginUser.id) + 1
      rankingMap.set(rule.code, {
        simpleRank: simpleRank,
        mu3SigmaRank: mu3SigmaRank,
        count: ratings.length
      })
    }
  }
  res.render('ranking', { loginUser, user: loginUser, isAdmin: isAdmin(req), rankingMap, rules: SPLAT_RULES_NAME_MAP })
})

app.get('/admin/users', isAuthenticated, async (req, res) => {
  if (!isAdmin(req)) {
    return res.redirect('/dashboard')
  }
  const profile = <Profile>req.user

  const loginUser = await prisma.user.findUnique({
    where: { id: profile.id },
  })
  if (!loginUser) {
    return res.status(404).send('User Not Found')
  }
  const users = await prisma.user.findMany()
  res.render('admin/users', { loginUser, users, isAdmin: isAdmin(req) })
})

app.get('/admin/user/:id', isAuthenticated, async (req, res) => {
  if (!isAdmin(req)) {
    return res.redirect('/dashboard')
  }
  const profile = <Profile>req.user

  const loginUser = await prisma.user.findUnique({
    where: { id: profile.id },
  })
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  })
  if (!user) {
    return res.status(404).send('User Not Found')
  }
  const ratings = await prisma.rating.findMany({
    where: { userId: user.id },
  })

  const gameResultRatings = await prisma.gameResultRating.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    include: { gameResult: true },
  })
  let rulesRatingMap = new Map()
  SPLAT_RULES_NAME_MAP.forEach(function (rule) {
    // do clone without npm clone module
    rulesRatingMap.set(rule.code, JSON.parse(JSON.stringify(Template)))
  })
  if (gameResultRatings) {
    gameResultRatings.forEach(function (gameResultRating) {
      let templateData = rulesRatingMap.get(gameResultRating.gameResult.rule)
      const formattedCreatedAt =
        gameResultRating.createdAt.getMonth() +
        1 +
        '/' +
        gameResultRating.createdAt.getDate() +
        ' ' +
        ('0' + gameResultRating.createdAt.getHours()).slice(-2) +
        ':' +
        ('0' + gameResultRating.createdAt.getMinutes()).slice(-2)
      templateData.data.labels.push(formattedCreatedAt)
      templateData.data.datasets[0].data.push(Math.floor(gameResultRating.muAfter))
    })
  }
  res.render('dashboard', { loginUser, user, isAdmin: isAdmin(req), ratings, rulesRatingMap, rules: SPLAT_RULES_NAME_MAP })
})

const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_CALLBACK_URL } = process.env
if (!DISCORD_CLIENT_ID) throw new Error('DISCORD_CLIENT_ID is not set')
if (!DISCORD_CLIENT_SECRET) throw new Error('DISCORD_CLIENT_SECRET is not set')

passport.use(
  new DiscordStrategy(
    {
      clientID: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      callbackURL: DISCORD_CALLBACK_URL,
      scope: ['identify'],
    },
    async (_accessToken: string, _refreshToken: string, profile: { id: string; username: string }, callback: (err: any, user: any) => void) => {
      try {
        console.log([_accessToken, _refreshToken, profile])
        let user = prisma.user.findUnique({
          where: {
            id: profile.id,
          },
        })
        if (!user) {
          user = prisma.user.create({ data: { id: profile.id, name: profile.username } })
          if (!user) {
            throw new Error('Cannot create user exception')
          }
        }
        return callback(null, profile)
      } catch (e) {
        return callback(e, null)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user: Express.User, done) => {
  done(null, user)
})

app.get('/auth/discord', passport.authenticate('discord'))
app.get(
  '/auth/discord/callback',
  passport.authenticate('discord', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
)

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})

// launch bot
require('./bot')
