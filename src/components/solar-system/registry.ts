import * as THREE from 'three'

/**
 * Vị trí thế giới (world position) của từng thiên thể, cập nhật mỗi frame.
 * CameraRig đọc từ đây để bay tới và bám theo hành tinh đang chọn
 * mà không cần re-render React.
 */
export const bodyPositions = new Map<string, THREE.Vector3>()

export function getOrCreatePosition(id: string): THREE.Vector3 {
  let pos = bodyPositions.get(id)
  if (!pos) {
    pos = new THREE.Vector3()
    bodyPositions.set(id, pos)
  }
  return pos
}

/**
 * Hệ số kích thước HIỆN TẠI của từng thiên thể so với "chế độ đẹp" (1 = chưa đổi).
 * Khi bật chế độ tỷ lệ thực, hành tinh co lại theo tỷ lệ thật — CameraRig đọc
 * hệ số này để tính khoảng cách camera phù hợp.
 */
export const bodyScales = new Map<string, number>()

export function getOrCreateScale(id: string): number {
  let s = bodyScales.get(id)
  if (s === undefined) {
    s = 1
    bodyScales.set(id, s)
  }
  return s
}

/**
 * Tiến trình chuyển cảnh giữa "chế độ đẹp" (t=0) và "tỷ lệ thực" (t=1).
 * ScaleRig lerp mượt; mọi component 3D đọc trực tiếp giá trị này mỗi frame.
 */
export const scaleState = { t: 0 }

/** HUD chế độ bay tự do: vận tốc hiện tại (đơn vị/giây) + trạng thái nút bay trên mobile */
export const flightHud = { speed: 0, mobileThrust: false }