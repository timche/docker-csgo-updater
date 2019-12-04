const { UPDATER_CONTAINER_IMAGE = 'timche/csgo' } = process.env

const csgoImageNameRegExp = new RegExp(
  `${UPDATER_CONTAINER_IMAGE}$|${UPDATER_CONTAINER_IMAGE}:.+`
)

export function isCSGOImage(imageName: string) {
  return csgoImageNameRegExp.test(imageName)
}
