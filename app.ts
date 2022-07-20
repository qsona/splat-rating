import express from 'express'
import passport from 'passport'
import { prisma } from './src/prismaClient'
import { SPLAT_RULES_NAME_MAP } from './src/rules'
const DiscordStrategy = require('passport-discord').Strategy

require('dotenv').config()

const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use('/static', express.static(__dirname + '/public'))
app.get('/', (req, res) => {
  res.render('index')
})
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany()
  res.render('users', { users })
})

app.get('/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { ratings: true },
  })
  if (!user) {
    return res.status(404).send('User Not Found')
  }
  res.render('user', { user, rules: SPLAT_RULES_NAME_MAP })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// passport.use(
//   new DiscordStrategy(
//     {
//       clientID: 'id',
//       clientSecret: 'secret',
//       callbackURL: 'http://localhost:3000/auth/discord/callback',
//       scope: ['identify'],
//     },
//     async (_accessToken: any, _refreshToken: any, profile: { id: string; username: string }, callback: (err: any, user: any) => void) => {
//       try {
//         let user = await prisma.user.findUnique({ where: { id: profile.id } })
//         if (!user) {
//           user = await prisma.user.create({ data: { id: profile.id, name: profile.username } })
//         }
//         callback(null, user)
//       } catch (e) {
//         callback(e, null)
//       }
//     }
//   )
// )
