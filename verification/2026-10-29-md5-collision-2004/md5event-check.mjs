import {hashHex, hexToBytes} from './event-md5-teaching.mjs';

export function compareMessages(firstHex, secondHex) {
  const first = hexToBytes(firstHex);
  const second = hexToBytes(secondHex);
  return {
    bytesA: first.length,
    bytesB: second.length,
    sameBytes: Buffer.from(first).equals(Buffer.from(second)),
    md5A: hashHex(first),
    md5B: hashHex(second),
  };
}
