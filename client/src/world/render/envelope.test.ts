// Envelope entre agentes: duração pela distância, pose em cada instante e a lista de voos em andamento.
import { describe, expect, it } from 'vitest';
import { flightDuration, Flights, MAX_MS, MIN_MS, PX_PER_MS, poseAt, type Flight } from './envelope';

const origin = { x: 0, y: 0 };
const flight: Flight = { id: 'a', from: origin, to: { x: 100, y: 40 }, start: 100, duration: 1000 };

describe('envelope', () => {
  it('duração pela distância, entre o mínimo e o máximo', () => {
    expect(flightDuration(origin, origin)).toBe(MIN_MS);
    expect(flightDuration(origin, { x: 315, y: 0 })).toBeCloseTo(MIN_MS, 9);
    expect(flightDuration(origin, { x: 300, y: 400 })).toBeCloseTo(500 / PX_PER_MS, 9);
    expect(flightDuration(origin, { x: 910, y: 0 })).toBe(MAX_MS);
    expect(flightDuration(origin, { x: 10000, y: -10000 })).toBe(MAX_MS);
  });

  it('nada antes de sair nem depois de chegar; nas pontas, posição exata e invisível', () => {
    expect(poseAt(flight, 99)).toBeNull();
    expect(poseAt(flight, 1101)).toBeNull();
    expect(poseAt(flight, 100)).toEqual({ id: 'a', t: 0, x: 0, y: 0, alpha: 0, tilt: 0 });
    const end = poseAt(flight, 1100)!;
    expect([end.t, end.x, end.y, end.alpha]).toEqual([1, 100, 40, 0]);
    expect(end.tilt).toBeCloseTo(0, 9);
  });

  it('no meio: metade do caminho, opaco e no alto do arco (mais alto quanto mais longe, até 48 px)', () => {
    const mid = poseAt(flight, 600)!;
    expect([mid.t, mid.x, mid.alpha]).toEqual([0.5, 50, 1]);
    expect(mid.y).toBeCloseTo(20 - (12 + Math.hypot(100, 40) * 0.25), 9);
    const far = { ...flight, to: { x: 1000, y: 0 } };
    expect(poseAt(far, 600)!.y).toBe(-48);
    expect(poseAt(far, 350)!.y).toBe(-36);
    expect(poseAt(far, 850)!.y).toBe(-36);
    expect(poseAt({ ...flight, to: origin }, 600)!.y).toBe(-12);
  });

  it('acelera e desacelera, entra e sai em fade e balança', () => {
    expect(poseAt(flight, 350)!.x).toBeCloseTo(12.5, 9);
    expect(poseAt(flight, 850)!.x).toBeCloseTo(87.5, 9);
    expect(poseAt(flight, 350)!.tilt).toBeCloseTo(0.25, 9);
    expect(poseAt(flight, 850)!.tilt).toBeCloseTo(-0.25, 9);
    expect(poseAt(flight, 150)!.alpha).toBeCloseTo(0.5, 9);
    expect(poseAt(flight, 200)!.alpha).toBeCloseTo(1, 9);
    expect(poseAt(flight, 1025)!.alpha).toBeCloseTo(0.5, 9);
  });

  it('id repetido não substitui o voo; no máximo 12 (sai o mais antigo)', () => {
    const fs = new Flights();
    expect(fs.add('a', origin, { x: 100, y: 0 }, 100)).toBe(true);
    expect(fs.add('a', { x: 999, y: 999 }, origin, 200)).toBe(false);
    expect(fs.poses(100)[0].x).toBe(0);
    const many = new Flights();
    for (let i = 0; i < 14; i++) many.add(String(i), origin, origin, 100);
    expect(many.size).toBe(12);
    expect(many.poses(100).map((p) => p.id)).toEqual(Array.from({ length: 12 }, (_, i) => String(i + 2)));
  });

  it('voos futuros esperam, o fim exato ainda aparece e os que chegaram saem', () => {
    const fs = new Flights();
    fs.add('early', origin, origin, 100);
    fs.add('future', origin, origin, 2000);
    expect(fs.poses(99)).toEqual([]);
    expect(fs.poses(1000).map((p) => p.id)).toEqual(['early']);
    expect(fs.poses(1001)).toEqual([]);
    expect(fs.size).toBe(1);
    expect(fs.poses(2901)).toEqual([]);
    expect(fs.size).toBe(0);
  });

  it('as pontas são copiadas: mexer nelas depois não desvia o voo', () => {
    const fs = new Flights();
    const from = { x: 10, y: 20 };
    const to = { x: 50, y: 60 };
    fs.add('a', from, to, 100);
    from.x = 999;
    to.y = 999;
    expect(fs.poses(100)[0].x).toBe(10);
    expect(fs.poses(1000)[0].y).toBe(60);
  });
});
