import express from 'express'
import passport from 'passport'
import { prisma } from './src/prismaClient'
import { SPLAT_RULES_NAME_MAP } from './src/rules'
const bodyParser = require('body-parser')
const DiscordStrategy = require('passport-discord').Strategy

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
    maxAge: 10 * 1000,
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
};
// TODO: move to class file
export type Profile = {
  id: string
  username: string
  avatar: string
  avatar_decoration: string
  discriminator: string
  public_flags: number
  flags: number
  banner: string
  banner_color: string
  accent_color: string
  locale: string
  mfa_enabled: boolean
  provider: string
  accessToken: string
  fetchedAt: Date
}

app.set('view engine', 'ejs')
app.use('/assets', express.static(__dirname + '/assets'))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/test', isAuthenticated, (req, res) => {
  res.render('table')
})

app.get('/login', (req, res) => {
  res.render('login')
})
app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
  const currentUser = <Profile>req.user
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: { Rating: true },
  })
  if (!user) {
    return res.status(404).send('User Not Found')
  }
  const ratings = await prisma.rating.findMany({
    where : { userId : user.id }
  })
  res.render('dashboard', { user, ratings, rules: SPLAT_RULES_NAME_MAP })
})

// TODO: to admin menu
// app.get('/dashboard/:id', isAuthenticated, async (req, res) => {
//   const user = await prisma.user.findUnique({
//     where: { id: req.params.id },
//     include: { Rating: true },
//   })
//   if (!user) {
//     return res.status(404).send('User Not Found')
//   }
//   const ratings = await prisma.rating.findMany({
//     where : { userId : user.id }
//   })
//   res.render('dashboard', { user, ratings, rules: SPLAT_RULES_NAME_MAP })
// })

app.get('/profile/:id', isAuthenticated, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { Rating: true },
  })
  if (!user) {
    return res.status(404).send('User Not Found')
  }
  res.render('profile', { user })
})

app.post('/profile/:id', isAuthenticated, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { Rating: true },
  })
  // TODO: check current login user === id user
  if (!user) {
    return res.status(404).send('User Not Found')
  }

  const newName = req.body.name
  // TODO: do validate & csrf token check
  const result = await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      name: newName,
    }
  })
  if (result.name !== newName) {
    return res.status(500).send('User Data update failed...')
  }
  res.redirect('/profile/' + user.id)
})

// TODO: showCount, pageId
app.get('/history/:id', isAuthenticated, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { Rating: true },
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

app.get('/users', isAuthenticated, async (req, res) => {
  const users = await prisma.user.findMany()
  res.render('users', { users })
})

app.get('/users/:id', isAuthenticated, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { Rating: true },
  })
  if (!user) {
    return res.status(404).send('User Not Found')
  }
  res.render('user', { user, rules: SPLAT_RULES_NAME_MAP })
})

const discordStrat = new DiscordStrategy(
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
)
passport.use(discordStrat)
passport.serializeUser((user, done) => {
  console.log(['serializeUser', user])
  done(null, user);
});
// passport.deserializeUser((user: Express.User, done) => {
passport.deserializeUser((user: { id: string, name: string}, done) => {
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
