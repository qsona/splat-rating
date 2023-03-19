jest.mock('./src/prismaClient', () => {
  return {
    prisma: jestPrisma.client,
  }
})
