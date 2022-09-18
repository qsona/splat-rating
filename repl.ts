import * as Repl from 'repl'
import { prisma } from './src/prismaClient'

import { registerUserAndRating } from './src/operations/registerUserAndRating'
import { createRoom } from './src/operations/createRoom'
import { joinRoom } from './src/operations/joinRoom'
import { leaveRoom } from './src/operations/leaveRoom'
import { breakRoom } from './src/operations/breakRoom'
import { createMatching } from './src/operations/createMatching'
import { reportMatching } from './src/operations/reportMatching'
import { cancelMatching } from './src/operations/cancelMatching'
import { getCurrentSeason } from './src/models/season'

// Print the welcome message
console.log(`
  Hello, ${process.env.USER}!
  You're running the Node.js REPL in ${process.cwd()}.
`)

// Start the REPL
const repl = Repl.start()

repl.context.prisma = prisma

Object.entries({
  registerUserAndRating,
  createRoom,
  joinRoom,
  leaveRoom,
  breakRoom,
  createMatching,
  reportMatching,
  cancelMatching,
  getCurrentSeason,
}).forEach(([k, v]) => {
  repl.context[k] = v
})
