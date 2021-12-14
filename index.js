//TODO: Если далеко от объема, то не проверяем, чтоб не выходить при отскоке с позиции если его снимают
//TODO: Скомпилировать для запуска без ноды
;(async () => {
  const Binance = require('node-binance-api')
  const readline = require('readline')
  const fs = require('fs')
  const path = require('path')

  const {APIKEY, APISECRET} = JSON.parse(fs.readFileSync(path.join(__dirname, '/config.json'), 'utf-8'))
  const binance = new Binance().options({
    APIKEY,
    APISECRET,
    useServerTime: true,
    recvWindow: 60000, // Set a higher recvWindow to increase response timeout
    verbose: true, // Add extra output when subscribing to WebSockets, etc
    log: (log) => {
      console.log(log) // You can create your own logger here, or disable console output
    },
  })
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let cost = '184.50000000'
  let tiket = 'XMRUSDT'

  rl.question("Enter a tiket: ", (ans) => {
    tiket = ans.toUpperCase()
    rl.question("Enter a cost: ", (ans) => {
      cost = (+ans).toFixed(8)
      console.log(tiket, cost)
      rl.close()
    })
  })

  rl.on("close", () => {
    if (isNaN(+cost)) {
      console.error('Error: cost is not a number')
      return
    }
    watch(binance, tiket, cost)
  });


  // console.info(await binance.futuresOpenOrders());
  // console.info( await binance.futuresOpenOrders( "BTCUSDT" ) );

})()


function watch(binance, tiket, cost) {
  binance.depth(tiket, (error, depth, symbol) => {
    if (error) {
      console.error(error)
      return
    }
    const bidAsk = {...depth.bids, ...depth.asks}
    const curr = bidAsk[cost]
    const int = setInterval(() => {
      binance.depth(symbol, (err, depth) => {
        const bidAsk = {...depth.bids, ...depth.asks}
        if (bidAsk[cost] < curr * 0.5) {
          console.log('Del pos')
          // console.info(await binance.futuresCancelAll(symbol));
          clearInterval(int)
        }
      })
    }, 500)
  });
}