import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadPresets, savePresets, matchesAnyPreset, getRandomPreset, toJsonLines } from '../sign-switcher-presets.mjs';

test('loadPresets returns {} for missing file', async () => {
  const result = await loadPresets(join(tmpdir(), `ss-nonexistent-${Date.now()}.json`));
  assert.deepEqual(result, {});
});

test('savePresets then loadPresets roundtrips data', async () => {
  const filePath = join(tmpdir(), `ss-test-${Date.now()}.json`);
  const presets = { Hello: ['Hello', 'World', '', ''] };
  await savePresets(presets, filePath);
  const loaded = await loadPresets(filePath);
  assert.deepEqual(loaded, presets);
});

test('matchesAnyPreset returns true when lines match a preset exactly', () => {
  const presets = { A: ['Hello', 'World', '', ''] };
  assert.equal(matchesAnyPreset(['Hello', 'World', '', ''], presets), true);
});

test('matchesAnyPreset returns false when a line differs', () => {
  const presets = { A: ['Hello', 'World', '', ''] };
  assert.equal(matchesAnyPreset(['Hello', 'Other', '', ''], presets), false);
});

test('matchesAnyPreset returns false for empty preset map', () => {
  assert.equal(matchesAnyPreset(['Hello', 'World', '', ''], {}), false);
});

test('matchesAnyPreset treats missing lines as empty string', () => {
  const presets = { A: ['Hi', '', '', ''] };
  assert.equal(matchesAnyPreset(['Hi', '', '', ''], presets), true);
  assert.equal(matchesAnyPreset(['Hi', 'extra', '', ''], presets), false);
});

test('matchesAnyPreset matches any preset in the map', () => {
  const presets = { A: ['foo', '', '', ''], B: ['bar', '', '', ''] };
  assert.equal(matchesAnyPreset(['bar', '', '', ''], presets), true);
});

test('getRandomPreset returns null for empty presets', () => {
  assert.equal(getRandomPreset({}), null);
});

test('getRandomPreset returns an array of 4 strings', () => {
  const presets = { A: ['a', 'b', 'c', 'd'] };
  const result = getRandomPreset(presets);
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 4);
});

test('getRandomPreset returns only presets that exist in the map', () => {
  const presets = { A: ['a', '', '', ''], B: ['b', '', '', ''] };
  for (let i = 0; i < 20; i++) {
    const result = getRandomPreset(presets);
    assert.ok(result === presets.A || result === presets.B);
  }
});

test('toJsonLines wraps each line in a JSON text component with minecraft:uniform', () => {
  const result = toJsonLines(['Hello', 'World', '', '']);
  assert.deepEqual(result, [
    '{"text":"Hello","font":"minecraft:uniform"}',
    '{"text":"World","font":"minecraft:uniform"}',
    '{"text":"","font":"minecraft:uniform"}',
    '{"text":"","font":"minecraft:uniform"}',
  ]);
});

test('toJsonLines handles Unicode fancy text', () => {
  const result = toJsonLines(['𝔽𝕠𝕟𝕥', 'ℂ𝕙𝕒𝕟𝕘𝕖𝕣', '', '']);
  assert.equal(result[0], '{"text":"𝔽𝕠𝕟𝕥","font":"minecraft:uniform"}');
  assert.equal(result[1], '{"text":"ℂ𝕙𝕒𝕟𝕘𝕖𝕣","font":"minecraft:uniform"}');
});

test('toJsonLines returns an array of the same length as input', () => {
  assert.equal(toJsonLines(['a', 'b', 'c', 'd']).length, 4);
  assert.equal(toJsonLines([]).length, 0);
});
