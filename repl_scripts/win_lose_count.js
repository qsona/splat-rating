var Aigle = require('aigle')
var users = await prisma.user.findMany()
var result = await Aigle.map(users, async (user) => {
  var rr = await prisma.gameResultRating.findMany({ where: { userId: user.id } })
  var winCount = rr.filter(r => r.isWinner).length
  var loseCount = rr.filter(r => !r.isWinner).length
  return { name: user.name, winCount, loseCount }
})
result.forEach(r => console.log(`${r.name} ${r.winCount}勝${r.loseCount}敗`))
