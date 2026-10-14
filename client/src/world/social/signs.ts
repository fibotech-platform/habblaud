// Placas de atividade das salas comuns (puro): que roda cada área mostra e com que texto. Quem está em cada roda
// vem de social.ts (Social.areaSigns); o desenho fica em render/overlay.ts.
import { tr } from '../../../../shared/i18n';
import type { Gathering, GatherKind } from './gathering';

/** O que a placa precisa saber de uma roda. */
export interface GatheringView {
  kind: GatherKind;
  phase: Gathering['phase'];
  /** Área (id) onde a roda acontece; null = sem lugar (jokenpô em pé). */
  area: string | null;
  /** Quantos já chegaram ao lugar (quem ainda está a caminho não conta). */
  arrived: number;
  /** War room de incidente: nome do projeto em incidente. */
  incidentRoom: string | null;
}

/**
 * Área -> texto da placa. Só war room, papo na copa, TV, videogame, pingue-pongue e fliperama têm placa; rodas
 * encerradas, sem área ou sem ninguém lá ainda, não. Várias rodas na mesma área: incidente > planejamento > o resto;
 * empate: a com mais gente; empate de novo: a primeira da lista.
 */
export function areaSigns(gs: readonly GatheringView[]): Map<string, string> {
  const winners = new Map<string, { priority: number; arrived: number; text: string }>();
  for (const g of gs) {
    if (g.phase === 'ended' || g.area === null || g.arrived < 1) continue;
    const n = g.arrived;
    let text: string;
    let priority = 0;
    switch (g.kind) {
      case 'warroom':
        priority = g.incidentRoom ? 2 : 1;
        text = g.incidentRoom ? tr('🚨 Incidente em {0} · {1} na mesa', [g.incidentRoom, n]) : tr('📋 Planejamento · {0} na mesa', [n]);
        break;
      case 'kitchen':
        text = n === 1 ? tr('☕ Papo rolando · 1 participante') : tr('☕ Papo rolando · {0} participantes', [n]);
        break;
      case 'tv':
        text = tr('📺 Vendo TV · {0}', [n]);
        break;
      case 'videogame':
        text = tr('🎮 Videogame · {0}', [n]);
        break;
      case 'pingpong':
        text = tr('🏓 Pingue-pongue · {0}', [n]);
        break;
      case 'arcade':
        text = tr('👾 Fliperama · {0}', [n]);
        break;
      default:
        continue;
    }
    const previous = winners.get(g.area);
    if (!previous || priority > previous.priority || (priority === previous.priority && n > previous.arrived)) {
      winners.set(g.area, { priority, arrived: n, text });
    }
  }
  return new Map([...winners].map(([area, w]) => [area, w.text]));
}
