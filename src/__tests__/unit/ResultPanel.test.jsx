import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ResultPanel from '@/app/components/ResultPanel'

describe('ResultPanel Component', () => {
  it('should render error message when error prop is provided', () => {
    render(<ResultPanel error="Conexión fallida" />)
    expect(screen.getByText('Conexión fallida')).toBeInTheDocument()
  })

  it('should render detected letter in static mode', () => {
    const result = { letter: 'A', confidence: 95.5, type: 'static' }
    render(<ResultPanel mode="static" result={result} />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('95.5%')).toBeInTheDocument()
  })

  it('should show placeholder when result is null', () => {
    render(<ResultPanel mode="static" result={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText('Empieza a hacer señas…')).toBeInTheDocument()
  })

  it('should render word and accepted tag in words mode', () => {
    const result = { word: 'HOLA', confidence: 88, accepted: true }
    render(<ResultPanel mode="words" result={result} />)
    expect(screen.getByText('HOLA')).toBeInTheDocument()
    expect(screen.getByText('✓ Aceptada')).toBeInTheDocument()
  })

  it('should render buffer stats when provided', () => {
    const stats = { total_received: 10, total_accepted: 8, acceptance_rate: 80 }
    render(<ResultPanel mode="words" bufferStats={stats} />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })
})
