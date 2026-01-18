import neon01 from './images/neon_city/neon_01.jpg'
import neon02 from './images/neon_city/neon_02.jpg'
import neon03 from './images/neon_city/neon_03.jpg'
import star01 from './images/starport_fleet/star_01.jpg'
import star02 from './images/starport_fleet/star_02.jpg'
import star03 from './images/starport_fleet/star_03.jpg'
import desert01 from './images/desert_oasis/desert_01.jpg'
import desert02 from './images/desert_oasis/desert_02.jpg'
import desert03 from './images/desert_oasis/desert_03.jpg'
import snow01 from './images/snow_mountain_base/snow_01.jpg'
import snow02 from './images/snow_mountain_base/snow_02.jpg'
import snow03 from './images/snow_mountain_base/snow_03.jpg'

export type SceneImageKey = 'A' | 'B' | 'C' | 'D'

export const scenesImages: Record<SceneImageKey, string[]> = {
  A: [neon01, neon02, neon03],
  B: [star01, star02, star03],
  C: [desert01, desert02, desert03],
  D: [snow01, snow02, snow03],
}

export default scenesImages
