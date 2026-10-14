// Temas de sala (puros): paletas escandinavas claras (madeira clara, off-white, tons suaves) e bem distintas.
// Sementes consecutivas (slots vizinhos) recebem temas diferentes; a ordem da lista alterna famílias de cor de propósito.
import type { RoomTheme } from './api';

const THEMES: readonly RoomTheme[] = [
  { carpet: '#e6ddd0', carpet2: '#ddd3c4', wall: { base: '#fbf9f5', trim: '#c9b79c', pattern: 'plain' }, accent: '#7fa07a', deskVariant: 'wood', chairVariant: 'sage' },
  { carpet: '#d9dde0', carpet2: '#cfd4d8', wall: { base: '#f6f7f7', trim: '#a9b4bc', pattern: 'wood_panel' }, accent: '#6f90b0', deskVariant: 'white', chairVariant: 'dusty' },
  { carpet: '#e9dccb', carpet2: '#e0d1be', wall: { base: '#fdf8f2', trim: '#d0a98a', pattern: 'plain' }, accent: '#c97c5d', deskVariant: 'wood', chairVariant: 'oat' },
  { carpet: '#dfe3d8', carpet2: '#d5dacd', wall: { base: '#f7f8f3', trim: '#a7b39b', pattern: 'wood_panel' }, accent: '#d4a94a', deskVariant: 'white', chairVariant: 'sage' },
  { carpet: '#e8e1da', carpet2: '#dfd7cf', wall: { base: '#fbf8f6', trim: '#c4a9a0', pattern: 'plain' }, accent: '#c98b97', deskVariant: 'wood', chairVariant: 'gray' },
  { carpet: '#d8dcd6', carpet2: '#cdd2cb', wall: { base: '#f4f6f3', trim: '#8fa397', pattern: 'stripes' }, accent: '#4f8f86', deskVariant: 'wood', chairVariant: 'charcoal' },
  { carpet: '#ece4d6', carpet2: '#e3dac9', wall: { base: '#fcfaf6', trim: '#bfa785', pattern: 'wood_panel' }, accent: '#8f7bb0', deskVariant: 'white', chairVariant: 'oat' },
  { carpet: '#dcd8d2', carpet2: '#d2cdc6', wall: { base: '#f7f6f4', trim: '#9c958c', pattern: 'plain' }, accent: '#5f7fa8', deskVariant: 'wood', chairVariant: 'dusty' },
  { carpet: '#e4e2d5', carpet2: '#dbd8c9', wall: { base: '#fafaf4', trim: '#b3ae8e', pattern: 'stripes' }, accent: '#9aa65a', deskVariant: 'white', chairVariant: 'charcoal' },
  { carpet: '#e9dfd6', carpet2: '#e0d4c9', wall: { base: '#fcf9f6', trim: '#b88f78', pattern: 'wood_panel' }, accent: '#b5654f', deskVariant: 'wood', chairVariant: 'terracotta' },
];

export const THEME_COUNT = THEMES.length;

export function roomTheme(seed: number): RoomTheme {
  const n = THEMES.length;
  const t = THEMES[((Math.floor(seed) % n) + n) % n];
  return { ...t, wall: { ...t.wall } };
}
