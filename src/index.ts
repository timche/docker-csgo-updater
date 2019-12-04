import delay from 'delay'
import * as pino from 'pino'
import logger from './logger'
import watchContainers from './watchContainers'

const {
  UPDATER_POLL_INTERVAL = 60 // Seconds
} = process.env

process.on(
  'uncaughtException',
  pino.final(logger, (err, finalLogger) => {
    finalLogger.error(err, 'uncaughtException')
    process.exit(1)
  })
)

process.on(
  // TS overload bug:
  // Argument of type '"unhandledRejection"' is not assignable to parameter of type 'Signals'.
  // @ts-ignore
  'unhandledRejection',
  pino.final(logger, (err, finalLogger) => {
    finalLogger.error(err, 'unhandledRejection')
    process.exit(1)
  })
)

async function dockerCSGOUpdater() {
  while (true) {
    watchContainers()
    await delay(Number(UPDATER_POLL_INTERVAL) * 1000)
  }
}

dockerCSGOUpdater()
