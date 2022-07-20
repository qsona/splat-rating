import express from 'express'
import passport from 'passport'
import { prisma } from './src/prismaClient'
import { SPLAT_RULES_NAME_MAP } from './src/rules'
const bodyParser = require('body-parser')
const DiscordStrategy = require('passport-discord').Strategy

require('dotenv').config()

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.set('view engine', 'ejs')
app.use('/assets', express.static(__dirname + '/assets'))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/test', (req, res) => {
  res.render('table')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/dashboard/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
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

app.get('/profile/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { Rating: true },
  })
  if (!user) {
    return res.status(404).send('User Not Found')
  }
  res.render('profile', { user })
})

app.post('/profile/:id', async (req, res) => {
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
app.get('/history/:id', async (req, res) => {
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

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany()
  res.render('users', { users })
})

app.get('/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { Rating: true },
  })
  if (!user) {
    return res.status(404).send('User Not Found')
  }
  res.render('user', { user, rules: SPLAT_RULES_NAME_MAP })
})

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_PUBLIC_KEY,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ['identify'],
    },
    function () {}
    // async (_accessToken: any, _refreshToken: any, profile: { id: string; username: string }, callback: (err: any, user: any) => void) => {
    //   try {
    //     console.log([_accessToken, _refreshToken, profile])
    //     let user = await prisma.user.findUnique({ where: { id: profile.id } })
    //     if (!user) {
    //       user = await prisma.user.create({ data: { id: profile.id, name: profile.username } })
    //     }
    //     callback(null, user)
    //   } catch (e) {
    //     callback(e, null)
    //   }
    // }
  )
)

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), function(req, res) {
  console.log(req)
  res.redirect('/dashboard')
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
