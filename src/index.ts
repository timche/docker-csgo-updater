import * as Docker from 'dockerode'
import * as pino from 'pino'
import { isCSGOImage } from './helpers'

const {
  UPDATER_POLL_INTERVAL = 1000 * 60 * 5 // 5 Minutes
} = process.env

const docker = new Docker()

const logger = pino()

let watchingContainers: string[] = []

function addWatchingContainer(containerId: string) {
  watchingContainers = watchingContainers.concat(containerId)
}

function removeWatchingContainer(containerId: string) {
  watchingContainers = watchingContainers.filter(
    watchingContainerId => watchingContainerId !== containerId
  )
}

async function watchContainer(containerInfo: Docker.ContainerInfo) {
  const container = docker.getContainer(containerInfo.Id)
  const containerName = containerInfo.Names[0].substr(1)

  logger.info(`Watching ${containerName} (${container.id})`)

  addWatchingContainer(container.id)

  const stdoutStream = await container.attach({ stream: true, stdout: true })

  const checkForUpdate = async (data: Buffer) => {
    const stdout = data.toString()

    if (stdout.includes('MasterRequestRestart')) {
      logger.info(`Detected update at ${containerName} (${container.id})`)

      stdoutStream.removeListener('data', checkForUpdate)

      logger.info(`Restarting ${containerName} (${container.id})`)

      container.restart({ t: 1800 }) // 30 Minutes
    }
  }

  stdoutStream.on('data', checkForUpdate)

  return new Promise(resolve => {
    stdoutStream.on('end', () => {
      stdoutStream.removeAllListeners()
      removeWatchingContainer(container.id)
      resolve()
    })
  })
}

async function getUnwatchedContainers() {
  const containers = await docker.listContainers()

  return containers.filter(
    ({ Id: id, Image: image }) =>
      isCSGOImage(image) && !watchingContainers.includes(id)
  )
}

async function watchNewContainers() {
  try {
    logger.debug('Looking for new containers ...')

    const unwatchedContainers = await getUnwatchedContainers()

    unwatchedContainers.forEach(async containerInfo => {
      try {
        await watchContainer(containerInfo)
      } catch (error) {
        logger.error(error)
      }
    })
  } catch (error) {
    logger.error(error)
  }
}

function wait(ms: number | string) {
  return new Promise(resolve => setTimeout(resolve, Number(ms)))
}

;(async () => {
  while (true) {
    watchNewContainers()
    await wait(UPDATER_POLL_INTERVAL)
  }
})()
