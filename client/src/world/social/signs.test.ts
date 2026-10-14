// Placas de atividade das salas comuns: textos, quem conta e qual roda vence quando há mais de uma na mesma área.
import { describe, expect, it } from 'vitest';
import { areaSigns, type GatheringView } from './signs';

const view = (o: Partial<GatheringView> = {}): GatheringView => ({ kind: 'kitchen', phase: 'run', area: 'copa', arrived: 2, incidentRoom: null, ...o });

describe('placas de atividade', () => {
  it('sem rodas, sem placas', () => {
    expect(areaSigns([])).toEqual(new Map());
  });

  it('ignora roda encerrada, sem área, sem ninguém lá ainda e as que não têm placa (papo a dois, jokenpô, espelho)', () => {
    const gs = [view({ phase: 'ended' }), view({ area: null }), view({ arrived: 0 }), ...(['talk', 'rps', 'mirror'] as const).map((kind) => view({ kind }))];
    expect(areaSigns(gs).size).toBe(0);
  });

  it('texto de cada roda (copa no singular e no plural)', () => {
    const cases: [GatheringView, string][] = [
      [view({ kind: 'warroom', incidentRoom: 'loja-virtual', arrived: 4 }), '🚨 Incidente em loja-virtual · 4 na mesa'],
      [view({ kind: 'warroom', arrived: 1 }), '📋 Planejamento · 1 na mesa'],
      [view({ arrived: 1 }), '☕ Papo rolando · 1 participante'],
      [view(), '☕ Papo rolando · 2 participantes'],
      [view({ kind: 'tv' }), '📺 Vendo TV · 2'],
      [view({ kind: 'videogame' }), '🎮 Videogame · 2'],
      [view({ kind: 'pingpong' }), '🏓 Pingue-pongue · 2'],
      [view({ kind: 'arcade' }), '👾 Fliperama · 2'],
    ];
    for (const [g, text] of cases) expect(areaSigns([g]).get('copa')).toBe(text);
  });

  it('em qualquer fase (indo, rolando, terminando) conta só quem chegou', () => {
    for (const phase of ['gather', 'run', 'final'] as const) expect(areaSigns([view({ phase, arrived: 1 })]).get('copa')).toBe('☕ Papo rolando · 1 participante');
  });

  it('incidente vence planejamento, que vence o resto, não importa a lotação nem a ordem', () => {
    const ordinary = view({ arrived: 20 });
    const planning = view({ kind: 'warroom', arrived: 10 });
    const incident = view({ kind: 'warroom', arrived: 1, incidentRoom: 'API' });
    for (const gs of [[ordinary, planning, incident], [incident, planning, ordinary]]) expect(areaSigns(gs).get('copa')).toBe('🚨 Incidente em API · 1 na mesa');
    for (const gs of [[ordinary, planning], [planning, ordinary]]) expect(areaSigns(gs).get('copa')).toBe('📋 Planejamento · 10 na mesa');
  });

  it('mesma prioridade: vence a com mais gente; empate exato: a primeira', () => {
    expect(areaSigns([view(), view({ kind: 'tv', arrived: 3 })]).get('copa')).toBe('📺 Vendo TV · 3');
    expect(areaSigns([view({ kind: 'warroom', incidentRoom: 'A' }), view({ kind: 'warroom', incidentRoom: 'B', arrived: 3 })]).get('copa')).toBe('🚨 Incidente em B · 3 na mesa');
    expect(areaSigns([view(), view({ kind: 'tv' })]).get('copa')).toBe('☕ Papo rolando · 2 participantes');
    expect(areaSigns([view({ kind: 'tv' }), view()]).get('copa')).toBe('📺 Vendo TV · 2');
  });

  it('áreas independentes', () => {
    expect(areaSigns([view(), view({ area: 'lounge', kind: 'tv' })])).toEqual(
      new Map([
        ['copa', '☕ Papo rolando · 2 participantes'],
        ['lounge', '📺 Vendo TV · 2'],
      ]),
    );
  });
});
