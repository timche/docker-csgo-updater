import * as Docker from 'dockerode'
import { isCSGOImage } from './helpers'
import logger from './logger'

const docker = new Docker()

let watchingContainers: string[] = []

async function watchContainer(containerInfo: Docker.ContainerInfo) {
  const container = docker.getContainer(containerInfo.Id)
  const containerName = containerInfo.Names[0]
  const containerId = container.id

  logger.info(`Watching ${containerName} (${containerId}) ...`)

  watchingContainers = watchingContainers.concat(containerId)

  const stdoutStream = await container.attach({ stream: true, stdout: true })

  const checkForUpdate = async (data: Buffer) => {
    const stdout = data.toString()

    if (stdout.includes('MasterRequestRestart')) {
      logger.info(`Detected update at ${containerName} (${container.id})`)

      stdoutStream.removeListener('data', checkForUpdate)

      logger.info(
        `Stopping ${containerName} (${container.id}) with SIGTERM ...`
      )

      container.kill({ signal: 'SIGTERM' })
    }
  }

  stdoutStream.on('data', checkForUpdate)

  stdoutStream.on('close', () => {
    logger.info(`${containerName} (${containerId}) stopped`)
    stdoutStream.removeAllListeners()
    watchingContainers = watchingContainers.filter(
      watchingContainerId => watchingContainerId !== containerId
    )
  })
}

async function getUnwatchedContainers() {
  const containers = await docker.listContainers()

  return containers.filter(
    ({ Id: id, Image: image }) =>
      isCSGOImage(image) && !watchingContainers.includes(id)
  )
}

export default async function watchContainers() {
  try {
    logger.debug('Looking for unwatched containers ...')

    const unwatchedContainers = await getUnwatchedContainers()

    unwatchedContainers.forEach(containerInfo => watchContainer(containerInfo))
  } catch (error) {
    logger.error(error)
  }
}
