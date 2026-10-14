// Envelope voando de um agente para outro (mensagem entre agentes pelo Habblaud), puro: duração pela distância,
// pose em cada instante (arco que sobe e desce, entra e sai em fade, balançando) e os voos em andamento. O gatilho
// fica na simulação (WorldEffect 'envelope'); o desenho, no renderer.

export interface Point {
  x: number;
  y: number;
}

export interface Flight {
  id: string;
  from: Point;
  to: Point;
  start: number;
  duration: number;
}

/** Posição (px de mundo), progresso `t` (0–1), opacidade e inclinação (radianos) do envelope. */
export interface EnvelopePose {
  id: string;
  x: number;
  y: number;
  t: number;
  alpha: number;
  tilt: number;
}

export const MIN_MS = 900;
export const MAX_MS = 2600;
export const PX_PER_MS = 0.35;
/** Voos ao mesmo tempo; passou disso, sai o mais antigo. */
export const MAX_FLIGHTS = 12;

/** Duração do voo pela distância, entre MIN_MS e MAX_MS. */
export function flightDuration(from: Point, to: Point): number {
  return Math.min(MAX_MS, Math.max(MIN_MS, Math.hypot(to.x - from.x, to.y - from.y) / PX_PER_MS));
}

/** Pose do envelope em `now`; null antes de começar ou depois de chegar. */
export function poseAt(f: Flight, now: number): EnvelopePose | null {
  if (now < f.start || now > f.start + f.duration) return null;
  const t = (now - f.start) / f.duration;
  const e = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
  const dist = Math.hypot(f.to.x - f.from.x, f.to.y - f.from.y);
  // arco: sobe e desce, mais alto quanto mais longe (até 48 px)
  const arc = 4 * Math.min(48, 12 + dist * 0.25) * t * (1 - t);
  return {
    id: f.id,
    x: t === 1 ? f.to.x : f.from.x + (f.to.x - f.from.x) * e,
    y: t === 1 ? f.to.y : f.from.y + (f.to.y - f.from.y) * e - arc,
    t,
    alpha: Math.min(1, t / 0.1, (1 - t) / 0.15),
    tilt: 0.25 * Math.sin(t * 2 * Math.PI),
  };
}

/** Voos em andamento. */
export class Flights {
  private flights = new Map<string, Flight>();

  /** Começa um voo (id repetido: ignora e devolve false). As pontas são copiadas: quem se mexe depois não o desvia. */
  add(id: string, from: Point, to: Point, now: number): boolean {
    if (this.flights.has(id)) return false;
    this.flights.set(id, { id, from: { ...from }, to: { ...to }, start: now, duration: flightDuration(from, to) });
    if (this.flights.size > MAX_FLIGHTS) this.flights.delete(this.flights.keys().next().value!);
    return true;
  }

  /** Poses dos voos em andamento; os que já chegaram saem da lista. */
  poses(now: number): EnvelopePose[] {
    const out: EnvelopePose[] = [];
    for (const [id, f] of this.flights) {
      if (now > f.start + f.duration) {
        this.flights.delete(id);
        continue;
      }
      const pose = poseAt(f, now);
      if (pose) out.push(pose);
    }
    return out;
  }

  get size(): number {
    return this.flights.size;
  }
}
