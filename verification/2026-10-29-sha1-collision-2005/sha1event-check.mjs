import fs from 'node:fs';
import {hashHex} from './event-sha1-teaching.mjs';

export const sha1File = file => hashHex(fs.readFileSync(file));

export function compareFiles(first, second) {
  const a = fs.readFileSync(first);
  const b = fs.readFileSync(second);
  return {
    bytesA: a.length,
    bytesB: b.length,
    sameLength: a.length === b.length,
    sameBytes: a.equals(b),
    sha1A: hashHex(a),
    sha1B: hashHex(b),
  };
}
