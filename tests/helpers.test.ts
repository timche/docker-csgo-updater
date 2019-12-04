import { isCSGOImage } from '../src/helpers'

describe('isCSGOImageName', () => {
  test('returns true', () => {
    expect(isCSGOImage('timche/csgo')).toBe(true)
    expect(isCSGOImage('timche/csgo:pug-practice')).toBe(true)
  })

  test('returns false', () => {
    expect(isCSGOImage('timche/csgo-foo')).toBe(false)
    expect(isCSGOImage('foo/bar')).toBe(false)
  })
})
