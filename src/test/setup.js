import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock de MediaPipe ya que corre en WebWorkers/WASm
vi.mock('@mediapipe/tasks-vision', () => {
  return {
    HandLandmarker: {
      createFromOptions: vi.fn().mockResolvedValue({
        detect: vi.fn().mockReturnValue({ landmarks: [] }),
        close: vi.fn()
      })
    },
    FilesetResolver: {
      forVisionTasks: vi.fn().mockResolvedValue({})
    }
  }
})

// Mock de la API del navegador para cámara
global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }]
  })
}
