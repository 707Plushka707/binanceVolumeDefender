//TODO: Если далеко от объема, то не проверяем, чтоб не выходить при отскоке с позиции если его снимают
//TODO: Скомпилировать для запуска без ноды
//TODO: Сделать авто переворот при разъедании (on/off) с указанием раб. объема/TP/SL можно в конфиг файле
//TODO: Просто вход в позицию при разъедании
;(async () => {
  const Binance = require('node-binance-api')
  const readline = require('readline')
  const fs = require('fs')
  const path = require('path')

  const { APIKEY, APISECRET, minVolumeMultiplier, enablePositionReverse } = JSON.parse(
    fs.readFileSync(path.join(__dirname, '/config.json'), 'utf-8')
  )

  const binance = new Binance().options({
    APIKEY,
    APISECRET,
    useServerTime: true,
    recvWindow: 60000,
    verbose: true,
    log: (log) => {
      console.log(log)
    },
  })
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  let cost = null
  let tiket = null
  rl.question('Enter a tiket: ', (ans) => {
    tiket = ans.toUpperCase()
    rl.question('Enter a cost: ', (ans) => {
      cost = (+ans).toFixed(8)
      console.log(tiket, cost)
      rl.close()
    })
  })

  rl.on('close', () => {
    if (isNaN(+cost)) {
      console.error('Error: cost is not a number')
      return
    }
    watch(binance, tiket, cost, minVolumeMultiplier)
  })
})()

function watch(binance, tiket, cost, minVolumeMultiplier) {
  binance.depth(tiket, (error, depth, symbol) => {
    if (error) {
      console.error(error)
      return
    }
    const bidAsk = { ...depth.bids, ...depth.asks }
    const curr = bidAsk[cost]
    console.log('Volume at ' + cost + ': ' + curr)
    const int = setInterval(() => {
      binance.depth(symbol, async (err, depth) => {
        const bidAsk = { ...depth.bids, ...depth.asks }
        if (bidAsk[cost] < curr * +minVolumeMultiplier) {
          console.log('Del pos')
          closePosition(binance, symbol)
          console.info(await binance.futuresCancelAll(symbol))
          clearInterval(int)
        }
      })
    }, 500)
  })
}

async function closePosition(binance, symbol) {
  let position_data = await binance.futuresPositionRisk(),
    markets = Object.keys(position_data)
  for (let market of markets) {
    let obj = position_data[market],
      size = Number(obj.positionAmt)
    if (size == 0) continue
    if (obj.symbol === symbol) {
      await binance.futuresMarketSell(obj.symbol, obj.positionAmt, { reduceOnly: true })
      await binance.futuresMarketBuy(obj.symbol, obj.positionAmt, { reduceOnly: true })
      break
    }
  }
}
