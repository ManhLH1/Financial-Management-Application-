/**
 * Translation Helper
 * Wrapper for LibreTranslate API to ensure Vietnamese translations
 * Always provides Vietnamese meaning for English-Vietnamese learning
 */

import { translateText, translateMultiple } from './libreTranslateHelper'

/**
 * Translate text to Vietnamese
 * Ensures we always get Vietnamese translation for learning purposes
 * @param {string} text - Text to translate (English)
 * @returns {Promise<string>} - Vietnamese translation
 */
export async function translateToVietnamese(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return ''
  }

  console.log(`🔄 translateToVietnamese: Translating "${text.substring(0, 50)}..."`)

  try {
    const translated = await translateText(text, 'en', 'vi')
    
    if (!translated || translated.trim() === '') {
      console.warn('⚠️ Empty translation received, returning original text')
      return text
    }

    console.log(`✅ Translation: "${translated.substring(0, 50)}..."`)
    return translated
  } catch (error) {
    console.error('❌ Translation failed:', error.message)
    // Return original text as fallback (better than nothing)
    // In learning context, English is still useful
    return text
  }
}

/**
 * Translate multiple texts to Vietnamese
 * @param {string[]} texts - Array of texts to translate
 * @returns {Promise<string[]>} - Array of Vietnamese translations
 */
export async function translateMultipleToVietnamese(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return []
  }

  console.log(`🔄 translateMultipleToVietnamese: Translating ${texts.length} items`)

  try {
    const translations = await translateMultiple(texts, 'en', 'vi')
    
    // Ensure we have translations for all texts
    const result = texts.map((text, index) => {
      const translation = translations[index]
      if (!translation || translation.trim() === '') {
        console.warn(`⚠️ Empty translation for text ${index}, using original`)
        return text
      }
      return translation
    })

    console.log(`✅ Translated ${result.length} items`)
    return result
  } catch (error) {
    console.error('❌ Batch translation failed:', error.message)
    // Return original texts as fallback
    return texts
  }
}

