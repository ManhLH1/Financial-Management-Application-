// API route to search words using Free Dictionary API
// https://dictionaryapi.dev/

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { word } = req.query

  if (!word || typeof word !== 'string' || word.trim() === '') {
    return res.status(400).json({ error: 'Word parameter is required' })
  }

  try {
    const searchWord = word.trim().toLowerCase()
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(searchWord)}`
    
    console.log(`🔍 Searching for word: ${searchWord}`)
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Word not found' })
      }
      throw new Error(`Dictionary API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform API response to our format
    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0]
      
      // Get first meaning with example
      const firstMeaning = entry.meanings?.[0]
      const firstDefinition = firstMeaning?.definitions?.[0]
      
      // Get phonetic and audio
      const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || ''
      const audioUS = entry.phonetics?.find(p => p.audio && p.audio.includes('us'))?.audio || 
                     entry.phonetics?.find(p => p.audio)?.audio || ''
      const audioUK = entry.phonetics?.find(p => p.audio && p.audio.includes('uk'))?.audio || ''
      
      const result = {
        word: entry.word,
        phonetic: phonetic,
        partOfSpeech: firstMeaning?.partOfSpeech || '',
        definition: firstDefinition?.definition || '',
        example: firstDefinition?.example || '',
        audioUS: audioUS,
        audioUK: audioUK,
        // Full data for detailed view
        fullData: {
          meanings: entry.meanings || [],
          phonetics: entry.phonetics || [],
          sourceUrls: entry.sourceUrls || []
        }
      }
      
      return res.status(200).json(result)
    }
    
    return res.status(404).json({ error: 'Word not found' })
  } catch (error) {
    console.error('Error searching word:', error)
    return res.status(500).json({ error: 'Failed to search word', details: error.message })
  }
}


