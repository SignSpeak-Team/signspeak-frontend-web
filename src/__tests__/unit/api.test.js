import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handResultToLandmarks, buildHolisticVector, getHealth } from '@/lib/api'

// Mock de fetch global
global.fetch = vi.fn()

describe('api.js utilities', () => {
  it('handResultToLandmarks should map MediaPipe landmarks correctly', () => {
    const mockResult = {
      landmarks: [[{ x: 0.1, y: 0.2, z: 0.3 }, { x: 0.4, y: 0.5, z: 0.6 }]]
    }
    const expected = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
    expect(handResultToLandmarks(mockResult)).toEqual(expected)
  })

  it('handResultToLandmarks should return null for empty landmarks', () => {
    expect(handResultToLandmarks(null)).toBeNull()
    expect(handResultToLandmarks({ landmarks: [] })).toBeNull()
  })

  it('buildHolisticVector should return a vector of exactly 226 elements', () => {
    const vector = buildHolisticVector([], [], [])
    expect(vector).toHaveLength(226)
    expect(vector.every(v => v === 0)).toBe(true)
  })

  it('buildHolisticVector should calculate coordinates relative to reference landmark', () => {
    const pose = [{ x: 10, y: 10, z: 10 }, { x: 11, y: 12, z: 13 }]
    const vector = buildHolisticVector(pose, [], [])
    // index 0,1,2 = nose (10-10, 10-10, 10-10)
    // index 3,4,5 = point 1 (11-10, 12-10, 13-10)
    expect(vector[0]).toBe(0)
    expect(vector[3]).toBe(1)
    expect(vector[4]).toBe(2)
  })

  it('getHealth should return api response on success', async () => {
    const mockResponse = { status: 'ok' }
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })
    
    const health = await getHealth()
    expect(health).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/health'), expect.any(Object))
  })
})
