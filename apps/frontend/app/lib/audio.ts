const isClient = typeof window !== 'undefined'

const setupAnalyser = () => {
  const audioContext = new AudioContext()
  const sourceNode = audioContext.createMediaElementSource(audio)
  const analyser = audioContext.createAnalyser()
  analyser.fftSize = 512 // small = fewer, chunkier frequency bins, good for a 3-bar eq
  sourceNode.connect(analyser)
  analyser.connect(audioContext.destination)
  return analyser
}

const audio = isClient ? new Audio() : (null as unknown as HTMLAudioElement)
const analyser = isClient ? setupAnalyser() : null

export const getAudio = () => audio
export const getAnalyser = () => analyser
