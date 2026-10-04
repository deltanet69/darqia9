import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const kode = getRouterParam(event, 'kode') || '10abc'
  
  // Format parsing: e.g. 10abc -> ['10A', '10B', '10C'], 10ab -> ['10A', '10B'], 10abcd -> ['10A', '10B', '10C', '10D']
  const match = kode.match(/^(\d+)([a-z]+)$/i)
  let levelNum = '10'
  let classLetters = ['A', 'B', 'C']

  if (match) {
    levelNum = match[1]
    classLetters = match[2].toUpperCase().split('')
  }

  const classes = classLetters.map(letter => `${levelNum}${letter}`)

  const config = {
    tepatMax: '06:45',
    toleransiMax: '07:00',
    gateCloseAutoAlpa: true
  }

  return {
    status: 'success',
    data: {
      kode,
      levelNum,
      classes,
      config,
      totalClasses: classes.length,
      timestamp: new Date().toISOString()
    }
  }
})
