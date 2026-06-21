import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MatchCard from './MatchCard'

const openMatch = {
  id: 1,
  home_team: { id: 1, name: 'España', flag: 'https://flagcdn.com/es.svg' },
  away_team: { id: 2, name: 'Francia', flag: 'https://flagcdn.com/fr.svg' },
  phase: 'groups',
  match_date_time: '2026-06-22 23:00:00',
  final_home_goals: null,
  final_away_goals: null,
}

const resolvedMatch = {
  ...openMatch,
  id: 2,
  final_home_goals: 2,
  final_away_goals: 1,
}

describe('MatchCard', () => {
  it('muestra equipos, fase traducida y cabecera "Por jugar" cuando no hay resultado', () => {
    render(
      <MatchCard match={openMatch}>
        <p>contenido hijo</p>
      </MatchCard>
    )

    expect(screen.getByText('España')).toBeInTheDocument()
    expect(screen.getByText('Francia')).toBeInTheDocument()
    expect(screen.getByText('Por jugar')).toBeInTheDocument()
    expect(screen.getByText('Grupos')).toBeInTheDocument()
    expect(screen.getByText('23/6, 01:00')).toBeInTheDocument()
    expect(screen.getByText('vs')).toBeInTheDocument()
  })

  it('muestra el marcador y la cabecera "Terminado" cuando el partido está resuelto', () => {
    render(
      <MatchCard match={resolvedMatch}>
        <p>contenido hijo</p>
      </MatchCard>
    )

    expect(screen.getByText('2 — 1')).toBeInTheDocument()
    expect(screen.getByText('Terminado')).toBeInTheDocument()
  })

  it('renderiza el contenido hijo dentro de la tarjeta', () => {
    render(
      <MatchCard match={openMatch}>
        <p>contenido hijo</p>
      </MatchCard>
    )

    expect(screen.getByText('contenido hijo')).toBeInTheDocument()
  })

  it('usa el valor crudo de fase si no está en el mapa de traducción', () => {
    const matchWithUnknownPhase = { ...openMatch, phase: 'penalties' }
    render(
      <MatchCard match={matchWithUnknownPhase}>
        <p>contenido hijo</p>
      </MatchCard>
    )

    expect(screen.getByText('penalties')).toBeInTheDocument()
  })

  it('usa headerColor para sobrescribir el color de cabecera por defecto', () => {
    const { container } = render(
      <MatchCard match={resolvedMatch} headerColor="bg-[#166534]">
        <p>contenido hijo</p>
      </MatchCard>
    )

    const header = screen.getByText('Terminado').parentElement
    expect(header.className).toContain('bg-[#166534]')
    expect(container.querySelector('.bg-gray-500')).not.toBeInTheDocument()
  })

  it('renderiza footer cuando se proporciona', () => {
    render(
      <MatchCard match={resolvedMatch} footer={<p>banda extra</p>}>
        <p>contenido hijo</p>
      </MatchCard>
    )

    expect(screen.getByText('banda extra')).toBeInTheDocument()
  })

  it('no renderiza nada extra cuando footer es falsy', () => {
    render(
      <MatchCard match={resolvedMatch} footer={false}>
        <p>contenido hijo</p>
      </MatchCard>
    )

    expect(screen.queryByText('banda extra')).not.toBeInTheDocument()
  })
})