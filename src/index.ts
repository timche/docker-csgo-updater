import delay from 'delay'
import * as pino from 'pino'
import logger from './logger'
import watchContainers from './watchContainers'

const {
  UPDATER_POLL_INTERVAL = 1000 * 60 * 5 // 5 Minutes
} = process.env

process.on(
  'uncaughtException',
  pino.final(logger, (err, finalLogger) => {
    finalLogger.error(err, 'uncaughtException')
    process.exit(1)
  })
)

process.on(
  'unhandledRejection',
  pino.final(logger, (err, finalLogger) => {
    finalLogger.error(err, 'unhandledRejection')
    process.exit(1)
  })
)

async function dockerCSGOUpdater() {
  while (true) {
    watchContainers()
    await delay(Number(UPDATER_POLL_INTERVAL))
  }
}

dockerCSGOUpdater()
