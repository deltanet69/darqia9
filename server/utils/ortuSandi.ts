// Hash kata sandi akun orang tua dengan scrypt bawaan Node (tanpa library). Murni, dipakai server
// dan skrip scripts/buat-akun-ortu.mjs. Format simpanan: scrypt$N$r$p$salt$hash (base64).
import { randomBytes, randomInt, scrypt, timingSafeEqual } from 'node:crypto'

const N = 16384
const R = 8
const P = 1
const PANJANG = 64

const turunkan = (sandi: string, salt: Buffer, n: number, r: number, p: number, panjang: number) =>
  new Promise<Buffer>((ok, gagal) => scrypt(sandi, salt, panjang, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (e, k) => e ? gagal(e) : ok(k)))

export async function hashSandiOrtu(sandi: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await turunkan(sandi, salt, N, R, P, PANJANG)
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`
}

export async function cocokSandiOrtu(sandi: string, simpanan: string): Promise<boolean> {
  const [alg, n, r, p, salt, hash] = String(simpanan || '').split('$')
  const angka = [Number(n), Number(r), Number(p)]
  // Parameter dibatasi agar baris rusak/aneh tidak bisa memaksa server menghitung scrypt raksasa.
  if (alg !== 'scrypt' || !salt || !hash || angka.some(x => !Number.isInteger(x) || x < 1) || angka[0]! > 1 << 17 || angka[1]! > 16 || angka[2]! > 4) return false
  const target = Buffer.from(hash, 'base64')
  if (target.length < 16) return false
  const hasil = await turunkan(sandi, Buffer.from(salt, 'base64'), angka[0]!, angka[1]!, angka[2]!, target.length)
  return timingSafeEqual(hasil, target)
}

// Hash tiruan untuk NIS yang tidak ada: waktu jawaban login sama, jadi keberadaan NIS tidak bisa ditebak dari durasi.
let hashTiruan: Promise<string> | null = null
export const hashTiruanOrtu = () => (hashTiruan ??= hashSandiOrtu(randomBytes(12).toString('hex')))

// Kata sandi awal 8 karakter tanpa huruf/angka yang mirip (0/O, 1/l/I) agar mudah dibaca dari kertas.
const HURUF = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
export const sandiAcakOrtu = (panjang = 8) => Array.from({ length: panjang }, () => HURUF[randomInt(HURUF.length)]).join('')

// Galat kata sandi baru (kosong = sah).
export const galatSandiBaruOrtu = (baru: string, nis: string, lama = ''): string => {
  if (typeof baru !== 'string' || baru.length < 8) return 'Kata sandi baru minimal 8 karakter.'
  if (baru.length > 72) return 'Kata sandi baru maksimal 72 karakter.'
  if (baru === nis) return 'Kata sandi tidak boleh sama dengan NIS.'
  if (lama && baru === lama) return 'Kata sandi baru harus berbeda dari kata sandi lama.'
  return ''
}
