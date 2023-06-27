/** @type {import('ts-jest').JestConfigWithTsJest} */
require('dotenv').config({ path: './.env.test' })

module.exports = {
  preset: 'ts-jest',
  // testEnvironment: 'node',
  testEnvironment: '@quramy/jest-prisma-node/environment',
  testEnvironmentOptions: {
    databaseUrl: process.env.DATABASE_URL, //'postgresql://qsona@localhost:5432/splat-rating-test',
    // enableExperimentalRollbackInTransaction: true,
  },
  setupFiles: ['./test-setup.js'],
  setupFilesAfterEnv: ['./test-setup-after-env.js'],
}
