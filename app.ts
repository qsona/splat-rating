import express from 'express'
import passport from 'passport'
import { prisma } from './src/prismaClient'
import { SPLAT_RULES_NAME_MAP } from './src/rules'
const bodyParser = require('body-parser')
const DiscordStrategy = require('passport-discord').Strategy
import { Template } from './src/models/graphData'
import { Profile } from './src/models/profile'

require('dotenv').config()
const session = require('express-session');
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  name: 'session',
  resave: false,
  saveUninitialized: true,
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
  },
}))
app.use(passport.initialize());
app.use(passport.session())

const isAuthenticated = (req: any, res: any, next: any) => {
  console.log('isAuthenticated')
  console.log([req.isAuthenticated(), req.user])
  if (req.isAuthenticated() && req.user) {
    next()
  } else {
    res.redirect('/login');
  }
}
const isAdmin = (req: any) => {
  console.log('isAdmin')
  const ADMIN_IDS = [
    '928994301373976607'
  ]
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
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
  // const loginUser = { id: '928994301373976607' }
  const loginUser = <Profile>req.user
  const user = await prisma.user.findUnique({
    where: { id: loginUser.id },
  })
  if (!user) {
    return res.status(404).send('User Not Found')
  }
  const ratings = await prisma.rating.findMany({
    where : { userId : user.id }
  })

  const gameResultRatings = await prisma.gameResultRating.findMany({
    where: { userId: user.id},
    orderBy: { createdAt: 'asc'},
    include: { gameResult: true }
  })
  let rulesRatingMap = new Map()
  SPLAT_RULES_NAME_MAP.forEach(function (rule) {
    // do clone without npm clone module
    rulesRatingMap.set(rule.code, JSON.parse(JSON.stringify(Template)))
  });
  if (gameResultRatings) {
    gameResultRatings.forEach(function (gameResultRating) {
      let templateData = rulesRatingMap.get(gameResultRating.gameResult.rule)
      const formattedCreatedAt = (gameResultRating.createdAt.getMonth() + 1) + '/' + gameResultRating.createdAt.getDate() + ' ' + ('0' + gameResultRating.createdAt.getHours()).slice(-2) + ':' + ('0' + gameResultRating.createdAt.getMinutes()).slice(-2)
      templateData.data.labels.push(formattedCreatedAt)
      templateData.data.datasets[0].data.push(Math.floor(gameResultRating.muAfter))
    })
  }
  res.render('dashboard', { user, isAdmin: isAdmin(req), ratings, rulesRatingMap, rules: SPLAT_RULES_NAME_MAP })
})

app.get('/profile', isAuthenticated, async (req, res) => {
  const loginUser = <Profile>req.user
  const user = await prisma.user.findUnique({
    where: { id: loginUser.id },
  })
  if (!user) {
    return res.status(404).send('User Not Found')
  }
  res.render('profile', { user, isAdmin: isAdmin(req) })
})

app.post('/profile', isAuthenticated, async (req, res) => {
  const loginUser = <Profile>req.user
  const user = await prisma.user.findUnique({
    where: { id: loginUser.id },
  })

  const newName = req.body.name
  // TODO: do validate & csrf token check
  const result = await prisma.user.update({
    where: {
      id: loginUser.id
    },
    data: {
      name: newName,
    }
  })
  if (result.name !== newName) {
    return res.status(500).send('User Data update failed...')
  }
  res.redirect('/profile')
})

// TODO: showCount, pageId
app.get('/history', isAuthenticated, async (req, res) => {
  const loginUser = <Profile>req.user
  const user = await prisma.user.findUnique({
    where: { id: loginUser.id },
  })
  if (!user) {
    return res.status(404).send('User Not Found')
  }
  const ratings = await prisma.gameResultRating.findMany({
    where: { userId: user.id},
    orderBy: { createdAt: 'desc'},
    include: { gameResult: true }
  })
  res.render('history', { user, ratings, rules: SPLAT_RULES_NAME_MAP })
})

app.get('/admin/users', isAuthenticated, async (req, res) => {
  if (!isAdmin(req)) {
    return res.redirect('/dashboard')
  }
  const users = await prisma.user.findMany()
  res.render('users', { users, isAdmin: isAdmin(req) })
})

app.get('/admin/user/:id', isAuthenticated, async (req, res) => {
  if (!isAdmin(req)) {
    return res.redirect('/dashboard')
  }
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { Rating: true },
  })
  if (!user) {
    return res.status(404).send('User Not Found')
  }
  res.render('user', { user, isAdmin: isAdmin(req), rules: SPLAT_RULES_NAME_MAP })
})

passport.use(new DiscordStrategy(
  {
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify'],
  },
  async (_accessToken: string, _refreshToken: string, profile: { id: string; username: string }, callback: (err: any, user: any) => void ) => {
    try {
      console.log([_accessToken, _refreshToken, profile])
      let user = prisma.user.findUnique({
        where: {
          id: profile.id
        }
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
))

passport.serializeUser((user, done) => {
  console.log(['serializeUser', user])
  done(null, user);
});
passport.deserializeUser((user: Express.User, done) => {
  console.log(['deserializeUser', user])
  done(null, user);
});

app.get('/auth/discord', passport.authenticate('discord'))
app.get('/auth/discord/callback', passport.authenticate('discord', {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
}))

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})
