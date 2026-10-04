import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { rfid_uid, card_id, timestamp, student_id } = body || {}

  const cardUid = rfid_uid || card_id
  if (!cardUid && !student_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'RFID UID atau ID Siswa wajib disertakan untuk absensi tap.'
    })
  }

  // Parse time
  const now = timestamp ? new Date(timestamp) : new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const currentMins = hours * 60 + minutes

  // Config bounds
  const TEPAT_MAX = 6 * 60 + 45 // <= 06:45
  const TOL_MAX = 7 * 60        // <= 07:00

  let status: 'tepat' | 'terlambat' | 'alpa' = 'tepat'
  if (currentMins <= TEPAT_MAX) {
    status = 'tepat'
  } else if (currentMins <= TOL_MAX) {
    status = 'terlambat'
  } else {
    status = 'alpa'
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const formattedTime = `${pad(hours)}:${pad(minutes)}`

  return {
    status: 'success',
    message: 'Tap RFID berhasil dicatat',
    data: {
      rfid_uid: cardUid,
      student_id: student_id || 'SMK-26270120001',
      jam_masuk: formattedTime,
      status,
      timestamp: now.toISOString()
    }
  }
})
