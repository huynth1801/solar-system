// Dữ liệu thiên thể — facts thực (NASA), kích thước/khoảng cách hiển thị đã nén cho dễ nhìn

export interface BodyInfo {
  diameter: string
  mass: string
  distanceLabel: string
  distance: string
  orbitalPeriod: string
  dayLength: string
  temperature: string
  moons: string
  description: string
  funFacts: string[]
}

export interface Atmosphere {
  color: string
  opacity: number
}

export interface Body {
  id: string
  name: string
  nameEn: string
  tagline: string
  texture: string
  bumpMap?: string
  nightMap?: string
  color: string
  radius: number
  orbitRadius: number
  /** Bán kính thật tính theo bán kính Trái Đất (Trái Đất = 1) — dùng cho chế độ tỷ lệ thực */
  realRadiusRatio: number
  /** Khoảng cách thật tính bằng AU (Mặt Trời = 0) — dùng cho chế độ tỷ lệ thực */
  realAU: number
  /** Danh sách vệ tinh lớn quay quanh (render bằng Moons) */
  moonIds?: string[]
  clouds?: boolean
  orbitPeriodDays: number
  rotationHours: number
  axialTilt: number
  orbitInclination: number
  rings?: boolean
  atmosphere?: Atmosphere
  info: BodyInfo
}

// 1 năm Trái Đất = 90 giây, 1 ngày Trái Đất (tự quay) = 10 giây ở tốc độ ×1
export const EARTH_ORBIT_SECONDS = 90
export const EARTH_SPIN_SECONDS = 10

// Chế độ "tỷ lệ thực": 1 Trái Đất = 0.09 đơn vị, 1 AU = 30 đơn vị
export const EARTH_REAL_RADIUS = 0.09
export const AU_UNITS = 30

export function realDisplayRadius(ratioToEarth: number): number {
  return ratioToEarth * EARTH_REAL_RADIUS
}

export const SUN: Body = {
  id: 'sun',
  name: 'Mặt Trời',
  nameEn: 'Sun',
  tagline: 'Ngôi sao trung tâm của Hệ Mặt Trời',
  texture: '/textures/sun.jpg',
  color: '#ffb347',
  radius: 4,
  orbitRadius: 0,
  realRadiusRatio: 109.2,
  realAU: 0,
  orbitPeriodDays: 1,
  rotationHours: 609.6,
  axialTilt: 7.25,
  orbitInclination: 0,
  info: {
    diameter: '1.392.700 km',
    mass: '1,989 × 10³⁰ kg',
    distanceLabel: 'Vị trí',
    distance: 'Trung tâm Hệ Mặt Trời',
    orbitalPeriod: '~230 triệu năm (quay quanh Ngân Hà)',
    dayLength: '25,4 ngày (tại xích đạo)',
    temperature: '5.500°C bề mặt · 15 triệu °C lõi',
    moons: '8 hành tinh, 5 vệ tinh lùn',
    description:
      'Mặt Trời là ngôi sao gần Trái Đất nhất và chiếm tới 99,86% khối lượng toàn bộ Hệ Mặt Trời. Đây là một khối cầu plasma khổng lồ chủ yếu gồm hydro và heli, nơi phản ứng tổng hợp hạt nhân mỗi giây chuyển đổi 4 triệu tấn vật chất thành năng lượng. Năng lượng đó là nguồn sống của mọi sinh vật trên Trái Đất.',
    funFacts: [
      'Có thể nhét vừa 1,3 triệu hành tinh Trái Đất bên trong Mặt Trời.',
      'Ánh sáng từ Mặt Trời mất 8 phút 20 giây để tới Trái Đất — bạn đang nhìn vào quá khứ.',
      'Tuổi của Mặt Trời khoảng 4,6 tỷ năm và nó sẽ tiếp tục cháy thêm 5 tỷ năm nữa.',
    ],
  },
}

export const PLANETS: Body[] = [
  {
    id: 'mercury',
    name: 'Sao Thủy',
    nameEn: 'Mercury',
    tagline: 'Hành tinh thứ 1 từ Mặt Trời',
    texture: '/textures/mercury.jpg',
    bumpMap: '/textures/mercury_bump.jpg',
    color: '#b8b0a8',
    radius: 0.35,
    orbitRadius: 7.5,
    realRadiusRatio: 0.383,
    realAU: 0.387,
    orbitPeriodDays: 87.97,
    rotationHours: 1407.6,
    axialTilt: 0.03,
    orbitInclination: 7.0,
    info: {
      diameter: '4.879 km',
      mass: '3,30 × 10²³ kg',
      distanceLabel: 'Cách Mặt Trời',
      distance: '57,9 triệu km',
      orbitalPeriod: '88 ngày Trái Đất',
      dayLength: '58,6 ngày Trái Đất',
      temperature: '−173°C đến 427°C',
      moons: '0 vệ tinh',
      description:
        'Sao Thủy là hành tinh nhỏ nhất và gần Mặt Trời nhất. Bề mặt của nó chi chít hố va chạm giống Mặt Trăng vì khí quyển gần như không tồn tại để bảo vệ. Do không có "tấm chăn" khí quyển, đây là hành tinh có chênh lệch nhiệt độ ngày đêm lớn nhất cả hệ.',
      funFacts: [
        'Một ngày ở Sao Thủy (từ bình minh đến bình minh) dài 176 ngày Trái Đất — gấp 2 năm của chính nó.',
        'Nhiệt độ dao động tới 600°C giữa ngày và đêm, chênh lệch lớn nhất Hệ Mặt Trời.',
        'Dù gần Mặt Trời nhất, vùng cực của Sao Thủy vẫn có băng nước trong các hố tối vĩnh viễn.',
      ],
    },
  },
  {
    id: 'venus',
    name: 'Sao Kim',
    nameEn: 'Venus',
    tagline: 'Hành tinh thứ 2 từ Mặt Trời',
    texture: '/textures/venus.jpg',
    color: '#e8c88f',
    radius: 0.55,
    orbitRadius: 10.5,
    realRadiusRatio: 0.949,
    realAU: 0.723,
    orbitPeriodDays: 224.7,
    rotationHours: 5832.5,
    axialTilt: 177.4,
    orbitInclination: 3.39,
    atmosphere: { color: '#e8c98a', opacity: 0.14 },
    info: {
      diameter: '12.104 km',
      mass: '4,87 × 10²⁴ kg',
      distanceLabel: 'Cách Mặt Trời',
      distance: '108,2 triệu km',
      orbitalPeriod: '224,7 ngày Trái Đất',
      dayLength: '243 ngày Trái Đất (quay ngược)',
      temperature: '464°C (nóng nhất Hệ Mặt Trời)',
      moons: '0 vệ tinh',
      description:
        'Sao Kim là "người chị em song sinh" của Trái Đất về kích thước, nhưng lại là địa ngục thật sự. Khí quyển CO₂ dày đặc gây hiệu ứng nhà kính cực đoan, làm bề mặt nóng hơn cả Sao Thủy. Những đám mây màu vàng bao quanh là axit sunfuric, và áp suất bề mặt gấp 92 lần Trái Đất.',
      funFacts: [
        'Sao Kim quay ngược chiều so với hầu hết hành tinh — trên đó Mặt Trời mọc ở phía Tây.',
        'Một ngày ở Sao Kim dài hơn một năm: tự quay mất 243 ngày nhưng quỹ đạo chỉ 225 ngày.',
        'Là thiên thể sáng nhất bầu trời đêm sau Mặt Trăng — người Việt gọi là Sao Mai hoặc Sao Hôm.',
      ],
    },
  },
  {
    id: 'earth',
    name: 'Trái Đất',
    nameEn: 'Earth',
    tagline: 'Hành tinh thứ 3 từ Mặt Trời · Ngôi nhà của chúng ta',
    texture: '/textures/earth.jpg',
    bumpMap: '/textures/earth_bump.jpg',
    nightMap: '/textures/earth_night.jpg',
    color: '#6ea8ff',
    radius: 0.6,
    orbitRadius: 14,
    realRadiusRatio: 1,
    realAU: 1,
    moonIds: ['moon'],
    orbitPeriodDays: 365.25,
    rotationHours: 23.93,
    axialTilt: 23.44,
    orbitInclination: 0,
    clouds: true,
    atmosphere: { color: '#5fb2ff', opacity: 0.18 },
    info: {
      diameter: '12.742 km',
      mass: '5,97 × 10²⁴ kg',
      distanceLabel: 'Cách Mặt Trời',
      distance: '149,6 triệu km (1 đơn vị AU)',
      orbitalPeriod: '365,25 ngày',
      dayLength: '23 giờ 56 phút',
      temperature: 'Trung bình 15°C',
      moons: '1 vệ tinh (Mặt Trăng)',
      description:
        'Trái Đất là hành tinh duy nhất được biết đến có sự sống. 71% bề mặt được bao phủ bởi nước, và khí quyển giàu oxy cùng từ trường mạnh đã che chắn sự sống khỏi bức xạ có hại trong hàng tỷ năm. Trục nghiêng 23,4° tạo ra bốn mùa quen thuộc.',
      funFacts: [
        'Trái Đất lao quanh Mặt Trời với tốc độ 107.000 km/h — bạn đang "đi super" mà không hay biết.',
        'Là hành tinh duy nhất không đặt tên theo một vị thần nào trong thần thoại.',
        'Từ không gian, Trái Đất được các phi hành gia gọi là "viên ngọc xanh" nhờ đại dương và khí quyển le lói ánh xanh.',
      ],
    },
  },
  {
    id: 'mars',
    name: 'Sao Hỏa',
    nameEn: 'Mars',
    tagline: 'Hành tinh thứ 4 từ Mặt Trời',
    texture: '/textures/mars.jpg',
    bumpMap: '/textures/mars_bump.jpg',
    color: '#e27b58',
    radius: 0.45,
    orbitRadius: 18,
    realRadiusRatio: 0.532,
    realAU: 1.524,
    orbitPeriodDays: 686.98,
    rotationHours: 24.62,
    axialTilt: 25.19,
    orbitInclination: 1.85,
    atmosphere: { color: '#e8a06a', opacity: 0.08 },
    info: {
      diameter: '6.779 km',
      mass: '6,42 × 10²³ kg',
      distanceLabel: 'Cách Mặt Trời',
      distance: '227,9 triệu km',
      orbitalPeriod: '687 ngày Trái Đất',
      dayLength: '24 giờ 37 phút',
      temperature: 'Trung bình −63°C',
      moons: '2 vệ tinh (Phobos, Deimos)',
      description:
        'Sao Hỏa — "Hành tinh Đỏ" — có màu đặc trưng nhờ oxit sắt (gỉ sắt) phủ khắp bề mặt. Đây là hành tinh được con người nghiên cứu nhiều nhất ngoài Trái Đất với hàng loạt xe thăm dò (rover) đang tuần tra. Sao Hỏa có cực băng, hẻm núi khổng lồ và là mục tiêu đưa con người đặt chân tới trong tương lai gần.',
      funFacts: [
        'Núi lửa Olympus Mons cao ~22 km — gấp 2,5 lần đỉnh Everest, là núi lửa cao nhất Hệ Mặt Trời.',
        'Hẻm núi Valles Marineris dài 4.000 km, rộng bằng chiều dài nước Mỹ.',
        'Bão bụi ở Sao Hỏa có thể bao trùm toàn bộ hành tinh trong nhiều tuần lễ.',
      ],
    },
  },
  {
    id: 'jupiter',
    name: 'Sao Mộc',
    nameEn: 'Jupiter',
    tagline: 'Hành tinh thứ 5 từ Mặt Trời',
    texture: '/textures/jupiter.jpg',
    color: '#d8b48f',
    radius: 2.35,
    orbitRadius: 26,
    realRadiusRatio: 11.21,
    realAU: 5.203,
    moonIds: ['io', 'europa', 'ganymede', 'callisto'],
    orbitPeriodDays: 4332.6,
    rotationHours: 9.93,
    axialTilt: 3.13,
    orbitInclination: 1.3,
    info: {
      diameter: '139.820 km',
      mass: '1,90 × 10²⁷ kg',
      distanceLabel: 'Cách Mặt Trời',
      distance: '778,5 triệu km',
      orbitalPeriod: '11,9 năm Trái Đất',
      dayLength: '9 giờ 56 phút (ngắn nhất hệ)',
      temperature: '−108°C (đỉnh mây)',
      moons: '95 vệ tinh đã biết',
      description:
        'Sao Mộc là "ông vua" của Hệ Mặt Trời — nặng gấp 2,5 lần tất cả các hành tinh khác cộng lại. Đây là hành tinh khí khổng lồ chủ yếu gồm hydro và heli, với những dải mây nhiều màu xoay theo vĩ độ. Vết Đỏ Lớn là cơn bão khổng lồ đã gầm thét hơn 350 năm.',
      funFacts: [
        'Vết Đỏ Lớn to đến mức có thể nhét cả Trái Đất vào trong đó.',
        'Sao Mộc quay quanh trục cực nhanh — một ngày chỉ chưa đến 10 giờ.',
        'Vệ tinh Europa được tin là có đại dương nước lỏng ngầm — ứng viên hàng đầu tìm sự sống.',
      ],
    },
  },
  {
    id: 'saturn',
    name: 'Sao Thổ',
    nameEn: 'Saturn',
    tagline: 'Hành tinh thứ 6 từ Mặt Trời',
    texture: '/textures/saturn.jpg',
    color: '#e3cfa2',
    radius: 2.0,
    orbitRadius: 35,
    realRadiusRatio: 9.45,
    realAU: 9.537,
    moonIds: ['titan'],
    rings: true,
    orbitPeriodDays: 10759,
    rotationHours: 10.66,
    axialTilt: 26.73,
    orbitInclination: 2.49,
    info: {
      diameter: '116.460 km',
      mass: '5,68 × 10²⁶ kg',
      distanceLabel: 'Cách Mặt Trời',
      distance: '1,43 tỷ km',
      orbitalPeriod: '29,5 năm Trái Đất',
      dayLength: '10 giờ 42 phút',
      temperature: '−139°C',
      moons: '146 vệ tinh đã biết',
      description:
        'Sao Thổ là viên ngọc của Hệ Mặt Trời với hệ vành đai băng đá tuyệt đẹp rộng tới 282.000 km nhưng chỉ dày từ 10 mét đến 1 km. Là hành tinh khí khổng lồ thứ hai, Sao Thổ nhẹ đến mức mật độ trung bình nhỏ hơn nước. Nghiêng 26,7° nên vành đai khoe đủ góc nhìn trong suốt hành trình quanh Mặt Trời.',
      funFacts: [
        'Nếu có một cái bể đủ lớn, Sao Thổ sẽ nổi trên nước.',
        'Vành đai chủ yếu là những viên băng nước — vài viên to như tòa nhà, nhiều viên bé như hạt bụi.',
        'Vệ tinh Titan có hồ và sông methane lỏng — nơi "mưa" và "sông" giống Trái Đất nhưng ở −179°C.',
      ],
    },
  },
  {
    id: 'uranus',
    name: 'Sao Thiên Vương',
    nameEn: 'Uranus',
    tagline: 'Hành tinh thứ 7 từ Mặt Trời',
    texture: '/textures/uranus.jpg',
    color: '#9fd8e3',
    radius: 1.15,
    orbitRadius: 44,
    realRadiusRatio: 4.01,
    realAU: 19.19,
    orbitPeriodDays: 30688.5,
    rotationHours: 17.24,
    axialTilt: 97.77,
    orbitInclination: 0.77,
    info: {
      diameter: '50.724 km',
      mass: '8,68 × 10²⁵ kg',
      distanceLabel: 'Cách Mặt Trời',
      distance: '2,87 tỷ km',
      orbitalPeriod: '84 năm Trái Đất',
      dayLength: '17 giờ 14 phút (quay ngược)',
      temperature: '−197°C',
      moons: '28 vệ tinh đã biết',
      description:
        'Sao Thiên Vương là "anh khổng lồ băng" lạ lùng nhất hệ: trục quay nghiêng tới 98°, khiến nó "nằm nghiêng" và lăn quanh Mặt Trời như một quả bóng. Màu xanh ngọc dịu nhẹ đến từ khí methane trong khí quyển hấp thụ ánh sáng đỏ. Đây là hành tinh đầu tiên được phát hiện bằng kính viễn vọng (1781).',
      funFacts: [
        'Vì nghiêng 98°, mỗi cực của Sao Thiên Vương có 42 năm ánh sáng liên tiếp rồi 42 năm bóng tối.',
        'Là hành tinh lạnh nhất Hệ Mặt Trời — xuống tới −224°C, lạnh hơn cả Sao Hải Vương xa hơn.',
        'Các vệ tinh của nó được đặt tên theo nhân vật Shakespeare, như Titania, Oberon, Miranda.',
      ],
    },
  },
  {
    id: 'neptune',
    name: 'Sao Hải Vương',
    nameEn: 'Neptune',
    tagline: 'Hành tinh thứ 8 từ Mặt Trời',
    texture: '/textures/neptune.jpg',
    color: '#5f7fe8',
    radius: 1.1,
    orbitRadius: 52,
    realRadiusRatio: 3.88,
    realAU: 30.07,
    moonIds: ['triton'],
    orbitPeriodDays: 60182,
    rotationHours: 16.11,
    axialTilt: 28.32,
    orbitInclination: 1.77,
    info: {
      diameter: '49.244 km',
      mass: '1,02 × 10²⁶ kg',
      distanceLabel: 'Cách Mặt Trời',
      distance: '4,5 tỷ km',
      orbitalPeriod: '165 năm Trái Đất',
      dayLength: '16 giờ 6 phút',
      temperature: '−201°C',
      moons: '16 vệ tinh đã biết',
      description:
        'Sao Hải Vương — hành tinh xa nhất — là miền xanh thẳm đầy gió dữ. Màu xanh đậm sâu của nó cũng do methane, đậm hơn sao Thiên Vương. Được phát hiện năm 1846 bằng phép tính toán học trước khi nhìn thấy, Sao Hải Vương là nơi có những cơn gió mạnh nhất Hệ Mặt Trời.',
      funFacts: [
        'Gió ở Sao Hải Vương đạt 2.100 km/h — nhanh gấp 5 lần gió trong cơn bão mạnh nhất trên Trái Đất.',
        'Kể từ khi được phát hiện (1846), Sao Hải Vương chỉ vừa hoàn thành đúng 1 vòng quỹ đạo vào năm 2011.',
        'Vệ tinh Triton quay ngược chiều — dấu hiệu nó có thể là thiên thể bị Sao Hải Vương "bắt cóc". Bấm vào Triton để khám phá!',
      ],
    },
  },
  {
    id: 'pluto',
    name: 'Sao Diêm Vương',
    nameEn: 'Pluto',
    tagline: 'Hành tinh lùn kiêm "hành tinh thứ 9" trong trái tim mọi người',
    texture: '/textures/pluto.jpg',
    color: '#c9b2a0',
    radius: 0.3,
    orbitRadius: 62,
    realRadiusRatio: 0.186,
    realAU: 39.5,
    orbitPeriodDays: 90560,
    rotationHours: 153.3,
    axialTilt: 122.5,
    orbitInclination: 17.2,
    info: {
      diameter: '2.376 km',
      mass: '1,31 × 10²² kg',
      distanceLabel: 'Cách Mặt Trời',
      distance: '5,9 tỷ km (39,5 AU)',
      orbitalPeriod: '248 năm Trái Đất',
      dayLength: '6,4 ngày Trái Đất',
      temperature: '−229°C',
      moons: '5 vệ tinh (Charon lớn nhất)',
      description:
        'Sao Diêm Vương từng là "hành tinh thứ 9" suốt 76 năm trước khi bị "giáng cấp" thành hành tinh lùn năm 2006. Nằm ở vành đai Kuiper ngoài rìa hệ, nó nhỏ hơn cả Mặt Trăng. Năm 2015, tàu New Horizons bay qua và tiết lộ một thế giới bất ngờ: núi băng, đồng bằng nitơ và "trái tim" Tombaugh Regio nổi tiếng.',
      funFacts: [
        'Vệ tinh Charon lớn tới nửa kích thước Pluto — cả hai thường được gọi là "hành tinh đôi".',
        'Trên Pluto có vùng hình trái tim tên Tombaugh Regio — băng nitơ đóng thành từng tấm khổng lồ.',
        'Một năm ở Pluto dài 248 năm Trái Đất — kể từ khi được phát hiện (1930) nó chưa đi hết nửa vòng quỹ đạo.',
      ],
    },
  },
]

/** Vệ tinh: quay quanh hành tinh mẹ, có thêm khoảng cách theo bán kính hành tinh mẹ (chế độ tỷ lệ thực) */
export interface MoonBody extends Body {
  parentId: string
  /** Quỹ đạo thật tính theo bán kính hành tinh mẹ (ví dụ Mặt Trăng = 60,3) */
  realOrbitParentRadii: number
}

export const MOON: MoonBody = {
  id: 'moon',
  name: 'Mặt Trăng',
  nameEn: 'Moon',
  tagline: 'Vệ tinh tự nhiên của Trái Đất',
  parentId: 'earth',
  texture: '/textures/moon.jpg',
  color: '#cfcfcf',
  radius: 0.16,
  orbitRadius: 1.7,
  realRadiusRatio: 0.273,
  realOrbitParentRadii: 60.3,
  realAU: 1,
  orbitPeriodDays: 27.32,
  rotationHours: 655.7,
  axialTilt: 6.68,
  orbitInclination: 5.14,
  info: {
    diameter: '3.474 km',
    mass: '7,35 × 10²² kg',
    distanceLabel: 'Cách Trái Đất',
    distance: '384.400 km',
    orbitalPeriod: '27,3 ngày',
    dayLength: '27,3 ngày (khóa thủy triều)',
    temperature: '−173°C đến 127°C',
    moons: 'Là vệ tinh của Trái Đất',
    description:
      'Mặt Trăng là vệ tinh lớn thứ 5 trong Hệ Mặt Trời và người bạn đồng hành thân thiết của Trái Đất. Trọng lực của nó tạo ra thủy triều và giúp ổn định trục quay Trái Đất. Mặt Trăng bị "khóa thủy triều" nên luôn hướng một mặt cố định về phía chúng ta — mặt xa của nó chỉ được nhìn thấy nhờ tàu vũ trụ.',
    funFacts: [
      'Mặt Trăng đang lùi xa Trái Đất khoảng 3,8 cm mỗi năm — bằng tốc độ mọc móng tay.',
      'Bàn chân và cờ của các phi hành gia Apollo vẫn còn in trên bề mặt vì không có gió.',
      'Nhờ trọng lực chỉ bằng 1/6 Trái Đất, ở đó bạn có thể nhảy cao gấp 6 lần.',
    ],
  },
}

/** Các vệ tinh lớn của Sao Mộc, Sao Thổ, Sao Hải Vương — texture procedural tự vẽ */
export const GIANT_MOONS: MoonBody[] = [
  {
    id: 'io',
    name: 'Io',
    nameEn: 'Io',
    tagline: 'Vệ tinh núi lửa của Sao Mộc',
    parentId: 'jupiter',
    texture: '',
    color: '#e8d44f',
    radius: 0.14,
    orbitRadius: 3.2,
    realRadiusRatio: 0.286,
    realOrbitParentRadii: 5.9,
    realAU: 5.203,
    orbitPeriodDays: 1.77,
    rotationHours: 42.5,
    axialTilt: 0,
    orbitInclination: 2.2,
    info: {
      diameter: '3.643 km',
      mass: '8,93 × 10²² kg',
      distanceLabel: 'Cách Sao Mộc',
      distance: '421.700 km',
      orbitalPeriod: '1,8 ngày',
      dayLength: 'Khóa thủy triều (1,8 ngày)',
      temperature: '−163°C (đỉnh núi lửa 1.600°C)',
      moons: 'Là vệ tinh của Sao Mộc',
      description:
        'Io là thiên thể có hoạt động núi lửa mạnh nhất cả Hệ Mặt Trời với hơn 400 núi lửa đang hoạt động. Lực hút "kéo co" từ Sao Mộc và các vệ tinh khác nhào nén lõi Io liên tục, tạo nhiệt lượng khổng lồ khiến bề mặt vàng cam loang lổ lưu huỳnh. Những đài phun bắn vật chất cao tới 500 km lên bầu trời.',
      funFacts: [
        'Một số đài phun của Io mạnh gấp hàng chục lần núi lửa Kīlauea trên Trái Đất.',
        'Bề mặt liên tục "tẩy trắng" bởi dung nham nên Io gần như không có hố va chạm.',
        'Năm 2023, tàu Juno bay sát chỉ cách Io 1.500 km để chụp ảnh cận cảnh.',
      ],
    },
  },
  {
    id: 'europa',
    name: 'Europa',
    nameEn: 'Europa',
    tagline: 'Vệ tinh đại dương ngầm — mục tiêu tìm sự sống',
    parentId: 'jupiter',
    texture: '',
    color: '#cfd8d3',
    radius: 0.12,
    orbitRadius: 4.1,
    realRadiusRatio: 0.245,
    realOrbitParentRadii: 9.4,
    realAU: 5.203,
    orbitPeriodDays: 3.55,
    rotationHours: 85.2,
    axialTilt: 0.1,
    orbitInclination: 1.8,
    info: {
      diameter: '3.122 km',
      mass: '4,80 × 10²² kg',
      distanceLabel: 'Cách Sao Mộc',
      distance: '671.000 km',
      orbitalPeriod: '3,6 ngày',
      dayLength: 'Khóa thủy triều (3,6 ngày)',
      temperature: '−171°C bề mặt · đại dương ngầm ấm hơn',
      moons: 'Là vệ tinh của Sao Mộc',
      description:
        'Europa là ứng viên số một tìm sự sống ngoài Trái Đất. Bên dưới lớp vỏ băng mịn phủ đầy vệt nứt màu nâu là một đại dương nước lỏng mặn — chứa lượng nước ước tính gấp đôi toàn bộ đại dương Trái Đất. Tàu Europa Clipper của NASA đã khởi hành năm 2024 và sẽ tới nơi năm 2030.',
      funFacts: [
        'Đại dương ngầm của Europa có thể sâu 60–150 km — chứa gấp 2 lần nước của Trái Đất.',
        'Bề mặt băng của Europa là một trong những "trẻ" nhất hệ — ít hố va chạm vì băng tự làm mới liên tục.',
        'Các vệt nứt đỏ nâu trên bề mặt là muối khoang từ đại dương ngầm trào lên khe nứt.',
      ],
    },
  },
  {
    id: 'ganymede',
    name: 'Ganymede',
    nameEn: 'Ganymede',
    tagline: 'Vệ tinh lớn nhất Hệ Mặt Trời',
    parentId: 'jupiter',
    texture: '',
    color: '#a89677',
    radius: 0.19,
    orbitRadius: 5.0,
    realRadiusRatio: 0.413,
    realOrbitParentRadii: 15.0,
    realAU: 5.203,
    orbitPeriodDays: 7.15,
    rotationHours: 171.7,
    axialTilt: 0.3,
    orbitInclination: 2.2,
    info: {
      diameter: '5.268 km',
      mass: '1,48 × 10²³ kg',
      distanceLabel: 'Cách Sao Mộc',
      distance: '1,07 triệu km',
      orbitalPeriod: '7,2 ngày',
      dayLength: 'Khóa thủy triều (7,2 ngày)',
      temperature: '−163°C',
      moons: 'Là vệ tinh của Sao Mộc',
      description:
        'Ganymede là vệ tinh lớn nhất Hệ Mặt Trời — lớn hơn cả hành tinh Sao Thủy, dù khối lượng chỉ bằng một nửa. Nó là vệ tinh duy nhất có từ trường riêng (do lõi sắt lỏng sinh ra), và cũng được tin có đại dương nước mặn ngầm ẩn dưới bề mặt băng.',
      funFacts: [
        'Nếu quay quanh Mặt Trời thay vì Sao Mộc, Ganymede đủ tiêu chuẩn làm hành tinh.',
        'Tàu JUICE của ESA (2023) sẽ vào quỹ đạo Ganymede khoảng 2034 — lần đầu con người đặt vệ tinh quanh vệ tinh.',
        'Cả ba "trăng lớn" của Galileo (Io, Europa, Ganymede) cộng hưởng quỹ đạo 1:2:4 như nhịp nhạc.',
      ],
    },
  },
  {
    id: 'callisto',
    name: 'Callisto',
    nameEn: 'Callisto',
    tagline: 'Bề mặt cổ xưa nhất Hệ Mặt Trời',
    parentId: 'jupiter',
    texture: '',
    color: '#6e675e',
    radius: 0.17,
    orbitRadius: 6.0,
    realRadiusRatio: 0.378,
    realOrbitParentRadii: 26.3,
    realAU: 5.203,
    orbitPeriodDays: 16.69,
    rotationHours: 400.5,
    axialTilt: 0,
    orbitInclination: 2.9,
    info: {
      diameter: '4.821 km',
      mass: '1,08 × 10²³ kg',
      distanceLabel: 'Cách Sao Mộc',
      distance: '1,88 triệu km',
      orbitalPeriod: '16,7 ngày',
      dayLength: 'Khóa thủy triều (16,7 ngày)',
      temperature: '−139°C',
      moons: 'Là vệ tinh của Sao Mộc',
      description:
        'Callisto có bề mặt bị va chạm "khủng khiếp" nhất hệ — chi chít hố va đọng từ 4 tỷ năm trước, gần như nguyên vẹn đến nay vì không có hoạt động địa chất nào tẩy sửa. Xa Sao Mộc và nằm ngoài vành bức xạ mạnh, Callisto từng được đề xuất làm địa điểm xây cứ điểm cho con người thăm dò Sao Mộc.',
      funFacts: [
        'Bề mặt Callisto là "bảo tàng hóa thạch" 4 tỷ năm tuổi của Hệ Mặt Trời.',
        'Vành hố va chạm Valhalla có đường kính 3.800 km — lớn hơn cả nước Ấn Độ.',
        'Có thể có đại dương nước mặn ngậm amoni sâu bên dưới lớp vỏ băng dày 250 km.',
      ],
    },
  },
  {
    id: 'titan',
    name: 'Titan',
    nameEn: 'Titan',
    tagline: 'Vệ tinh có khí quyển dày và hồ methane',
    parentId: 'saturn',
    texture: '',
    color: '#d8a04f',
    radius: 0.17,
    orbitRadius: 5.0,
    realRadiusRatio: 0.404,
    realOrbitParentRadii: 20.3,
    realAU: 9.537,
    orbitPeriodDays: 15.95,
    rotationHours: 382.7,
    axialTilt: 0.3,
    orbitInclination: 0.3,
    info: {
      diameter: '5.150 km',
      mass: '1,35 × 10²³ kg',
      distanceLabel: 'Cách Sao Thổ',
      distance: '1,22 triệu km',
      orbitalPeriod: '16 ngày',
      dayLength: 'Khóa thủy triều (16 ngày)',
      temperature: '−179°C',
      moons: 'Là vệ tinh của Sao Thổ',
      description:
        'Titan là vệ tinh duy nhất có bầu khí quyển dày (dày hơn của Trái Đất) và là nơi duy nhất ngoài Trái Đất có chất lỏng đứng yên trên bề mặt — nhưng là hồ và sông methane lỏng thay vì nước. Năm 2005, tàu Huygens hạ cánh xuống Titan — vụ hạ cánh xa nhất nhân loại từng thực hiện. Sứ mệnh Dragonfly sẽ phóng drone bay lượn trên Titan thập niên 2030.',
      funFacts: [
        'Titan lớn hơn Sao Thủy — nếu quay quanh Mặt Trời, nó sẽ là hành tinh.',
        'Trên Titan, gió thổi mạnh nên "cát" của các cồn đụn là hạt băng, và mưa là methane loãng như xăng.',
        'Khí quyển Titan giàu nitơ giống Trái Đất thuở sơ khai — " phòng thí nghiệm" về nguồn gốc sự sống.',
      ],
    },
  },
  {
    id: 'triton',
    name: 'Triton',
    nameEn: 'Triton',
    tagline: 'Vệ tinh quay ngược — kẻ bị "bắt cóc"',
    parentId: 'neptune',
    texture: '',
    color: '#cfd4dd',
    radius: 0.12,
    orbitRadius: 2.5,
    realRadiusRatio: 0.212,
    realOrbitParentRadii: 14.3,
    realAU: 30.07,
    orbitPeriodDays: -5.88,
    rotationHours: 141.0,
    axialTilt: 0,
    orbitInclination: 23.0,
    info: {
      diameter: '2.707 km',
      mass: '2,14 × 10²² kg',
      distanceLabel: 'Cách Sao Hải Vương',
      distance: '354.800 km',
      orbitalPeriod: '5,9 ngày (quay ngược)',
      dayLength: 'Khóa thủy triều (5,9 ngày)',
      temperature: '−235°C — một trong những nơi lạnh nhất hệ',
      moons: 'Là vệ tinh của Sao Hải Vương',
      description:
        'Triton quay ngược chiều với chiều quay của Sao Hải Vương — dấu hiệu gần chắc chắn nó không sinh ra ở đây mà là một thiên thể vành đai Kuiper bị hấp dẫn "bắt cóc". Bề mặt băng nitơ hồng nhạt còn có các mạch phun khí nitơ hoạt động, và từ từ Triton đang xoắn chậm vào Sao Hải Vương rồi sẽ bị xé toạc thành vành đai trong vài tỷ năm tới.',
      funFacts: [
        'Là vệ tinh lớn duy nhất trong hệ quay ngược chiều hành tinh mẹ.',
        'Nhiệt độ −235°C — lạnh gần bằng tuyệt đối mà thiên văn từng đo ở vệ tinh lớn nào.',
        'Vì quay ngược, Triton dần mất năng lượng và sẽ tan vỡ thành vành đai cho Sao Hải Vương sau ~3,6 tỷ năm.',
      ],
    },
  },
]

export const MOONS_BY_PARENT: Record<string, MoonBody[]> = {}
for (const m of [...GIANT_MOONS, MOON]) {
  ;(MOONS_BY_PARENT[m.parentId] ??= []).push(m)
}

export const COMET: Body = {
  id: 'comet',
  name: 'Sao Chổi',
  nameEn: 'Comet',
  tagline: 'Khách du hành băng ngang Hệ Mặt Trời',
  texture: '',
  color: '#7fd0ff',
  radius: 0.12,
  orbitRadius: 30,
  realRadiusRatio: 0.0002,
  realAU: 17,
  orbitPeriodDays: 1,
  rotationHours: 100,
  axialTilt: 0,
  orbitInclination: 14,
  info: {
    diameter: 'Vài km — "hòn đá băng" của vũ trụ',
    mass: '~10¹³ – 10¹⁴ kg',
    distanceLabel: 'Quỹ đạo elip',
    distance: 'Sát Mặt Trời rồi lao ra rìa hệ',
    orbitalPeriod: 'Vài phút trong mô phỏng này',
    dayLength: '—',
    temperature: 'Rất lạnh (dưới −100°C) · cận nhật băng bốc hơi',
    moons: '—',
    description:
      'Sao chổi là khối băng, bụi và đá còn từ thời Hệ Mặt Trời hình thành — "hoá thạch" 4,6 tỷ năm tuổi. Khi lao lại gần Mặt Trời, băng bốc hơi tạo thành đầu sáng và chiếc đuôi dài hàng triệu km. Chiếc đuôi này luôn hướng ra xa Mặt Trời, bất kể sao chổi đang bay hướng nào.',
    funFacts: [
      'Đuôi sao chổi có thể dài hàng trăm triệu km — dài hơn cả khoảng cách Trái Đất – Mặt Trời.',
      'Sao chổi Halley nổi tiếng sẽ quay lại gần Trái Đất vào năm 2061.',
      'Nước trên Trái Đất ngày nay có thể một phần do sao chổi đem đến từ hàng tỷ năm trước.',
    ],
  },
}

export const ALL_BODIES: Body[] = [SUN, ...PLANETS, MOON, ...GIANT_MOONS, COMET]

export function bodyById(id: string): Body | undefined {
  return ALL_BODIES.find((b) => b.id === id)
}

// Thứ tự chip điều hướng nhanh
export const CHIP_ORDER: string[] = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'comet',
]

/** Các hàng trong modal So sánh kích thước (bán kính theo tỷ lệ Trái Đất = 1) */
export const COMPARE_ROWS: Array<{ title: string; note?: string; items: string[] }> = [
  {
    title: 'Hành tinh đá',
    note: 'Nhóm gần Trái Đất — bé vừa phải, gần nhau về kích thước',
    items: ['mercury', 'venus', 'earth', 'mars', 'moon'],
  },
  {
    title: 'Khổng lồ khí & băng',
    note: 'Nhóm ngoài — lớn gấp hàng chục lần Trái Đất',
    items: ['jupiter', 'saturn', 'uranus', 'neptune'],
  },
  {
    title: 'Vệ tinh lớn & Sao Diêm Vương',
    note: 'Ganymede và Titan còn lớn hơn cả hành tinh Sao Thủy!',
    items: ['ganymede', 'titan', 'callisto', 'io', 'europa', 'triton', 'pluto', 'mercury'],
  },
]
