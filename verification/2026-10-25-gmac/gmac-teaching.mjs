import {createCipheriv, createDecipheriv} from 'node:crypto';

const bytes = hex => Buffer.from(hex, 'hex');
const hex = buffer => buffer.toString('hex');

export function gmacEncrypt(keyHex, ivHex, aadHex = '') {
  const cipher = createCipheriv('aes-128-gcm', bytes(keyHex), bytes(ivHex));
  if (aadHex) cipher.setAAD(bytes(aadHex));
  const ciphertext = Buffer.concat([cipher.update(Buffer.alloc(0)), cipher.final()]);
  if (ciphertext.length !== 0) throw Error('GMAC produced ciphertext');
  return cipher.getAuthTag().toString('hex');
}

export function gmacVerify(keyHex, ivHex, aadHex, tagHex) {
  const tag = bytes(tagHex);
  const decipher = createDecipheriv('aes-128-gcm', bytes(keyHex), bytes(ivHex), {authTagLength: tag.length});
  decipher.setAuthTag(tag);
  if (aadHex) decipher.setAAD(bytes(aadHex));
  const plaintext = Buffer.concat([decipher.update(Buffer.alloc(0)), decipher.final()]);
  if (plaintext.length !== 0) throw Error('GMAC decryption returned plaintext');
  return true;
}

export const GMAC_VECTOR = {
  key: '77be63708971c4e240d1cb79e8d77feb',
  iv: 'e0e00f19fed7ba0136a797f3',
  aad: '7a43ec1d9c0a5a78a0b16533a6213cab',
  tag: '209fcc8d3675ed938e9c7166709dd946'
};
