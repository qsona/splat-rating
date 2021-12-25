import * as Repl from 'repl'
import { prisma } from './src/prismaClient'
import { calculateMatchingWithMinRateDiff, createGameMatching, createGameResult } from './src/operations'

// Print the welcome message
console.log(`
  Hello, ${process.env.USER}!
  You're running the Node.js REPL in ${process.cwd()}.
`)

// Start the REPL
const repl = Repl.start()

repl.context.prisma = prisma

Object.entries({
  calculateMatchingWithMinRateDiff,
  createGameMatching,
  createGameResult,
}).forEach(([k, v]) => {
  repl.context[k] = v
})
