// API route to get vocabulary words by topic using Datamuse API
// https://www.datamuse.com/api/
// Uses LibreTranslate for Vietnamese translation
// Uses DictionaryAPI for detailed word information (optional)

import { translateMultiple } from '../../../lib/libreTranslateHelper'

/**
 * Get words from Datamuse API by topic
 * @param {string} topic - Topic keyword
 * @param {number} max - Maximum number of words to return
 * @returns {Promise<Array>} - Array of word objects from Datamuse
 */
async function getWordsFromDatamuse(topic, max = 20) {
  const queryTopic = topic.toLowerCase()
  const strategies = [
    { label: 'topics', url: `https://api.datamuse.com/words?topics=${encodeURIComponent(queryTopic)}&max=${max}` },
    { label: 'ml', url: `https://api.datamuse.com/words?ml=${encodeURIComponent(queryTopic)}&max=${max}` },
    { label: 'rel_trg', url: `https://api.datamuse.com/words?rel_trg=${encodeURIComponent(queryTopic)}&max=${max}` }
  ]

  for (const strategy of strategies) {
    try {
      console.log(`🔍 Datamuse (${strategy.label}) for "${queryTopic}"`)
      const response = await fetch(strategy.url)

      if (!response.ok) {
        console.error(`❌ Datamuse ${strategy.label} failed with ${response.status}`)
        continue
      }

      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        console.log(`✅ ${data.length} words via ${strategy.label}`)
        return data
      }
      console.warn(`⚠️ Datamuse ${strategy.label} returned 0 words`)
    } catch (error) {
      console.error(`❌ Error fetching via ${strategy.label}:`, error.message)
    }
  }

  return []
}

/**
 * Get detailed word information from DictionaryAPI
 * @param {string} word - Word to look up
 * @returns {Promise<Object|null>} - Word details or null if not found
 */
async function getWordDetailsFromDictionary(word) {
  try {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null // Word not found
      }
      throw new Error(`Dictionary API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0]
      const firstMeaning = entry.meanings?.[0]
      const firstDefinition = firstMeaning?.definitions?.[0]
      
      return {
        word: entry.word,
        phonetic: entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '',
        partOfSpeech: firstMeaning?.partOfSpeech || '',
        definitionEN: firstDefinition?.definition || '',
        exampleEN: firstDefinition?.example || '',
        audioUS: entry.phonetics?.find(p => p.audio && p.audio.includes('us'))?.audio || 
                 entry.phonetics?.find(p => p.audio)?.audio || '',
        audioUK: entry.phonetics?.find(p => p.audio && p.audio.includes('uk'))?.audio || '',
        fullData: {
          meanings: entry.meanings || [],
          phonetics: entry.phonetics || []
        }
      }
    }
    
    return null
  } catch (error) {
    console.error(`❌ Error fetching word details for "${word}":`, error.message)
    return null
  }
}

/**
 * Try Google Translate as fallback
 */
async function tryGoogleTranslate(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return ''
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      const translated = data[0].map(item => item[0]).join('')
      if (translated && translated.trim() !== '' && translated.trim() !== text.trim()) {
        return translated
      }
    }
    
    throw new Error('Google Translate returned invalid response')
  } catch (error) {
    console.error('❌ Google Translate error:', error.message)
    throw error
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { topic, max = '20', useDictionary = 'true' } = req.query

  if (!topic || typeof topic !== 'string' || topic.trim() === '') {
    return res.status(400).json({ error: 'Topic parameter is required' })
  }

  try {
    const topicKeyword = topic.trim()
    const maxWords = parseInt(max) || 20
    const useDictionaryAPI = useDictionary === 'true'

    console.log(`📚 Getting vocabulary for topic: "${topicKeyword}" (max: ${maxWords}, useDictionary: ${useDictionaryAPI})`)

    // Step 1: Get words from Datamuse
    const datamuseWords = await getWordsFromDatamuse(topicKeyword, maxWords)
    
    if (datamuseWords.length === 0) {
      return res.status(200).json({ 
        topic: topicKeyword,
        words: [],
        message: 'No words found for this topic'
      })
    }

    // Step 2: Process each word with small concurrency limit to avoid timeouts
    // Shuffle so each request feels different even with same topic
    const shuffledWords = datamuseWords
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(maxWords, 20))

    const wordsToProcess = shuffledWords
    const processedWords = []
    const CONCURRENCY_LIMIT = 4

    const processWord = async (datamuseWord) => {
      const word = datamuseWord.word

      try {
        const wordData = {
          word,
          score: datamuseWord.score || 0,
          phonetic: '',
          partOfSpeech: '',
          definition: '',
          definitionEN: '',
          example: '',
          exampleEN: '',
          audioUS: '',
          audioUK: '',
          simpleMeaning: word
        }

        if (useDictionaryAPI) {
          const dictData = await getWordDetailsFromDictionary(word)

          if (dictData) {
            wordData.phonetic = dictData.phonetic
            wordData.partOfSpeech = dictData.partOfSpeech
            wordData.definitionEN = dictData.definitionEN
            wordData.exampleEN = dictData.exampleEN
            wordData.audioUS = dictData.audioUS
            wordData.audioUK = dictData.audioUK
          }
        }

        const textsToTranslate = []
        if (wordData.definitionEN) textsToTranslate.push(wordData.definitionEN)
        if (wordData.exampleEN) textsToTranslate.push(wordData.exampleEN)

        if (textsToTranslate.length > 0) {
          try {
            const translations = await translateMultiple(textsToTranslate, 'en', 'vi')

            if (wordData.definitionEN && translations[0]) {
              wordData.definition = translations[0]
              if (wordData.definition.trim() === wordData.definitionEN.trim()) {
                wordData.definition = await tryGoogleTranslate(wordData.definitionEN)
              }
            }

            if (wordData.exampleEN) {
              const exampleIndex = wordData.definitionEN ? 1 : 0
              if (translations[exampleIndex]) {
                wordData.example = translations[exampleIndex]
                if (wordData.example.trim() === wordData.exampleEN.trim()) {
                  wordData.example = await tryGoogleTranslate(wordData.exampleEN)
                }
              }
            }
          } catch (error) {
            console.error(`❌ Translation error for "${word}":`, error.message)
            try {
              if (wordData.definitionEN) {
                wordData.definition = await tryGoogleTranslate(wordData.definitionEN)
              }
              if (wordData.exampleEN) {
                wordData.example = await tryGoogleTranslate(wordData.exampleEN)
              }
            } catch (googleError) {
              console.error(`❌ Google Translate also failed for "${word}"`)
              wordData.definition = wordData.definitionEN || word
              wordData.example = wordData.exampleEN || ''
            }
          }
        } else {
          try {
            const wordTranslation = await translateMultiple([word], 'en', 'vi')
            if (wordTranslation[0] && wordTranslation[0] !== word) {
              wordData.simpleMeaning = wordTranslation[0]
              wordData.definition = wordTranslation[0]
            }
          } catch (error) {
            console.error(`❌ Error translating word "${word}":`, error.message)
          }
        }

        if (!wordData.definition || wordData.definition.trim() === '') {
          wordData.definition = wordData.simpleMeaning || word
        }

        return wordData
      } catch (error) {
        console.error(`❌ Error processing word "${word}":`, error.message)
        return {
          word,
          score: datamuseWord.score || 0,
          definition: word,
          simpleMeaning: word
        }
      }
    }

    for (let i = 0; i < wordsToProcess.length; i += CONCURRENCY_LIMIT) {
      const batch = wordsToProcess.slice(i, i + CONCURRENCY_LIMIT)
      const batchResults = await Promise.all(batch.map(processWord))
      processedWords.push(...batchResults.filter(Boolean))
    }

    console.log(`✅ Processed ${processedWords.length} words for topic "${topicKeyword}"`)

    return res.status(200).json({
      topic: topicKeyword,
      words: processedWords,
      total: processedWords.length
    })
  } catch (error) {
    console.error('Error getting vocabulary by topic:', error)
    return res.status(500).json({ 
      error: 'Failed to get vocabulary by topic', 
      details: error.message 
    })
  }
}

