const { UPDATER_CSGO_IMAGE = 'timche/csgo' } = process.env

const csgoImageNameRegExp = new RegExp(
  `${UPDATER_CSGO_IMAGE}$|${UPDATER_CSGO_IMAGE}:.+`
)

export function isCSGOImage(imageName: string) {
  return csgoImageNameRegExp.test(imageName)
}
