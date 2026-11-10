// Pembatas percobaan salah di memori server (tanpa dependency): setelah `batas` kegagalan dalam
// `jendelaMs` sejak kegagalan pertama, kunci itu ditolak sampai jendelanya lewat.
// Satu instance server = satu penghitung; cukup untuk satu VPS.
export const buatPembatas = (batas: number, jendelaMs: number, sekarang: () => number = Date.now) => {
  const peta = new Map<string, { jumlah: number, mulai: number }>()
  const aktif = (kunci: string) => {
    const c = peta.get(kunci)
    if (c && sekarang() - c.mulai >= jendelaMs) { peta.delete(kunci); return undefined }
    return c
  }
  return {
    terblokir: (kunci: string) => (aktif(kunci)?.jumlah ?? 0) >= batas,
    catat: (kunci: string) => {
      const c = aktif(kunci)
      if (c) { c.jumlah++; return }
      if (peta.size >= 10000) for (const k of [...peta.keys()]) aktif(k) // buang yang sudah kedaluwarsa
      peta.set(kunci, { jumlah: 1, mulai: sekarang() })
    },
    hapus: (kunci: string) => { peta.delete(kunci) }
  }
}
