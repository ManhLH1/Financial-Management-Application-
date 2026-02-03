// API route to search words using Free Dictionary API
// https://dictionaryapi.dev/
// Uses LibreTranslate API for Vietnamese translations
// Ensures Vietnamese meaning is always available for English-Vietnamese learning

import { translateMultiple } from '../../../lib/libreTranslateHelper'
import { createSimpleMeaning } from '../../../lib/simpleMeaningHelper'

/**
 * Try Google Translate as fallback
 * Uses Google Translate web API (no API key needed for basic usage)
 */
async function tryGoogleTranslate(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return ''
  }

  try {
    // Use Google Translate web API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      const translated = data[0].map(item => item[0]).join('')
      if (translated && translated.trim() !== '' && translated.trim() !== text.trim()) {
        console.log(`✅ Google Translate success: "${translated.substring(0, 50)}..."`)
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
      
      // Get English definition and example
      const englishDefinition = firstDefinition?.definition || ''
      const englishExample = firstDefinition?.example || ''
      
      // Get phonetic and audio
      const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || ''
      const audioUS = entry.phonetics?.find(p => p.audio && p.audio.includes('us'))?.audio || 
                     entry.phonetics?.find(p => p.audio)?.audio || ''
      const audioUK = entry.phonetics?.find(p => p.audio && p.audio.includes('uk'))?.audio || ''
      
      // Get part of speech
      const partOfSpeech = firstMeaning?.partOfSpeech || ''
      
      console.log('📥 Raw data from Dictionary API:')
      console.log('   englishDefinition:', englishDefinition ? `"${englishDefinition.substring(0, 100)}..."` : '(empty)')
      console.log('   englishExample:', englishExample ? `"${englishExample.substring(0, 100)}..."` : '(empty)')
      
      // Translate definition and example to Vietnamese using LibreTranslate
      // Use batch translation for better performance
      const textsToTranslate = []
      if (englishDefinition) textsToTranslate.push(englishDefinition)
      if (englishExample) textsToTranslate.push(englishExample)
      
      console.log(`📝 Texts to translate: ${textsToTranslate.length} items`)
      
      let vietnameseDefinition = ''
      let vietnameseExample = ''
      
      if (textsToTranslate.length > 0) {
        console.log('🔄 Starting translation with LibreTranslate API...')
        try {
          const translations = await translateMultiple(textsToTranslate, 'en', 'vi')
          
          if (englishDefinition && translations[0]) {
            vietnameseDefinition = translations[0]
            // Validate translation - ensure it's different from original
            if (vietnameseDefinition.trim() === englishDefinition.trim()) {
              console.warn('⚠️ Translation same as original, LibreTranslate might not be working')
              // Try Google Translate as fallback
              vietnameseDefinition = await tryGoogleTranslate(englishDefinition)
            }
          }
          
          if (englishExample) {
            const exampleIndex = englishDefinition ? 1 : 0
            if (translations[exampleIndex]) {
              vietnameseExample = translations[exampleIndex]
              // Validate translation
              if (vietnameseExample.trim() === englishExample.trim()) {
                console.warn('⚠️ Example translation same as original, trying Google Translate')
                vietnameseExample = await tryGoogleTranslate(englishExample)
              }
            }
          }
          
          console.log('✅ Translation completed:')
          console.log('   vietnameseDefinition:', vietnameseDefinition ? `"${vietnameseDefinition.substring(0, 100)}..."` : '(empty)')
          console.log('   vietnameseExample:', vietnameseExample ? `"${vietnameseExample.substring(0, 100)}..."` : '(empty)')
        } catch (error) {
          console.error('❌ Error with LibreTranslate API:', error.message)
          // Try Google Translate as fallback
          console.log('🔄 Trying Google Translate as fallback...')
          try {
            if (englishDefinition) {
              vietnameseDefinition = await tryGoogleTranslate(englishDefinition)
            }
            if (englishExample) {
              vietnameseExample = await tryGoogleTranslate(englishExample)
            }
          } catch (googleError) {
            console.error('❌ Google Translate also failed:', googleError.message)
            // Final fallback: Use English text
            vietnameseDefinition = englishDefinition
            vietnameseExample = englishExample
            console.log('⚠️ Using English as final fallback')
          }
        }
      } else {
        console.log('⚠️ No texts to translate (both definition and example are empty)')
      }
      
      // Ensure we always have Vietnamese translation
      // If translation failed or empty, use English as fallback
      if (!vietnameseDefinition || vietnameseDefinition.trim() === '') {
        vietnameseDefinition = englishDefinition
      }
      if (!vietnameseExample || vietnameseExample.trim() === '') {
        vietnameseExample = englishExample
      }
      
      // Create simple meaning (short, concise definition)
      const simpleMeaning = createSimpleMeaning(
        entry.word || searchWord,
        vietnameseDefinition || englishDefinition,
        englishDefinition,
        partOfSpeech
      )
      
      const result = {
        word: entry.word,
        phonetic: phonetic,
        partOfSpeech: partOfSpeech,
        simpleMeaning: simpleMeaning, // Short, concise meaning (e.g., "số 10" for "ten")
        definition: vietnameseDefinition || englishDefinition, // Vietnamese translation from LibreTranslate, fallback to English
        definitionEN: englishDefinition, // Keep English definition for reference
        example: vietnameseExample || englishExample, // Vietnamese translation from LibreTranslate, fallback to English
        exampleEN: englishExample, // Keep English example for reference
        audioUS: audioUS,
        audioUK: audioUK,
        // Full data for detailed view
        fullData: {
          meanings: entry.meanings || [],
          phonetics: entry.phonetics || [],
          sourceUrls: entry.sourceUrls || []
        }
      }
      
      console.log('📊 Final result:')
      console.log('   word:', result.word)
      console.log('   definition (VI):', result.definition ? `"${result.definition.substring(0, 50)}..."` : '(empty)')
      console.log('   definition (EN):', result.definitionEN ? `"${result.definitionEN.substring(0, 50)}..."` : '(empty)')
      console.log('   example (VI):', result.example ? `"${result.example.substring(0, 50)}..."` : '(empty)')
      console.log('   example (EN):', result.exampleEN ? `"${result.exampleEN.substring(0, 50)}..."` : '(empty)')
      
      return res.status(200).json(result)
    }
    
    return res.status(404).json({ error: 'Word not found' })
  } catch (error) {
    console.error('Error searching word:', error)
    return res.status(500).json({ error: 'Failed to search word', details: error.message })
  }
}


