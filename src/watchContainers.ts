import * as Docker from 'dockerode'
import { isCSGOImage } from './helpers'
import logger from './logger'

const docker = new Docker()

let watchingContainers: string[] = []

async function watchContainer(containerInfo: Docker.ContainerInfo) {
  try {
    const container = docker.getContainer(containerInfo.Id)
    const containerName = containerInfo.Names[0]
    const containerId = container.id

    let updating = false

    watchingContainers = watchingContainers.concat(containerId)

    const attachContainer = async () => {
      logger.info(`Watching ${containerName} (${containerId}) ...`)

      const stdoutStream = await container.attach({
        stream: true,
        stdout: true
      })

      stdoutStream.on('error', logger.error)

      const checkForUpdate = async (data: Buffer) => {
        try {
          const stdout = data.toString()

          if (stdout.includes('MasterRequestRestart')) {
            updating = true

            logger.info(
              `Update available for ${containerName} (${container.id}), restarting with SIGINT ...`
            )

            stdoutStream.removeListener('data', checkForUpdate)

            await Promise.all([
              container.kill({ signal: 'SIGINT' }),
              container.wait()
            ])

            updating = false

            logger.debug(`Starting ${containerName} (${container.id}) ...`)

            await container.start()

            logger.debug(`${containerName} (${container.id}) started`)

            await attachContainer()
          }
        } catch (error) {
          logger.error(error)
        }
      }

      stdoutStream.on('data', checkForUpdate)

      stdoutStream.on('close', async () => {
        try {
          stdoutStream.removeAllListeners()

          logger.debug(`${containerName} (${containerId}) stopped`)

          if (!updating) {
            logger.debug(`Stopped watching ${containerName} (${containerId})`)

            watchingContainers = watchingContainers.filter(
              watchingContainerId => watchingContainerId !== containerId
            )
          }
        } catch (error) {
          logger.error(error)
        }
      })
    }

    await attachContainer()
  } catch (error) {
    logger.error(error)
  }
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
