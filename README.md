# Binance Volume Bot Defender

## Описание

### Бот защиты торговли отскоков от объемов на бирже Binance(только для фьючерсов)

Бот закрывает все позции по монете если объем, от которого вы планировали отскок, потерял больше половины изначального
значения.

#### Для чего это нужно?

Если начнется разъедание сайза и пробой уровня, то ваща позиция будет вовремя закрыта и вы не понесете убытков

#### Например:

- Планировался отскок от уровня 1.2
- На нем лимитная заявка на 100 монет
- Вы вошли в позицию на отскок
- Если объем на уровне 1.2 упадет до 50 монет(или ниже) то ваши позиции закроются по рынку

## Как начать работу

1. Установить [NodeJS](https://nodejs.org/en/)
2. В файле `config.json` изменить поля `APIKEY` и `APISECRET` на апи ключ с бинанса
3. Запустить `install.bat` или в консоле открыть папку проекта и ввести `npm i`
4. Запустить `run.bat` или в консоле открыть папку проекта и ввести `node index.js`
5. Указать какую монету будете торговать
6. Указать уровень(спота!) на котором стоит сайз 
7. При проедании этого уровня все позиции по этой монете закроются
