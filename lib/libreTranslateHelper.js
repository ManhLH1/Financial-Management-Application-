/**
 * LibreTranslate API Helper
 * Uses LibreTranslate (Open Source Machine Translation API) to translate text
 * 
 * LibreTranslate: https://libretranslate.com/
 * API Docs: https://docs.libretranslate.com/
 * 
 * Setup:
 * 1. Use public instance: https://libretranslate.com/ (no API key needed for basic usage)
 * 2. Or self-host: https://github.com/LibreTranslate/LibreTranslate
 * 3. Optional: Set LIBRETRANSLATE_API_URL in .env for custom instance
 * 4. Optional: Set LIBRETRANSLATE_API_KEY in .env if using paid instance
 */

// Default to public LibreTranslate instance
const DEFAULT_API_URL = 'https://libretranslate.com'
const LIBRETRANSLATE_API_URL = process.env.LIBRETRANSLATE_API_URL || DEFAULT_API_URL
const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single'
const RATE_LIMIT_MAX_REQUESTS = 9
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_COOL_OFF_MS = 65_000

let libreWindowStart = 0
let libreRequestCount = 0
let libreRateLimitedUntil = 0

function canUseLibreTranslate() {
  const now = Date.now()

  if (now < libreRateLimitedUntil) {
    return false
  }

  if (now - libreWindowStart > RATE_LIMIT_WINDOW_MS) {
    libreWindowStart = now
    libreRequestCount = 0
  }

  if (libreRequestCount >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  libreRequestCount += 1
  return true
}

function markLibreRateLimited() {
  libreRateLimitedUntil = Date.now() + RATE_LIMIT_COOL_OFF_MS
  console.warn(`⚠️ LibreTranslate rate limit hit, cooling down for ${Math.round(RATE_LIMIT_COOL_OFF_MS / 1000)}s`)
}

async function translateViaGoogle(text, sourceLang, targetLang) {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: sourceLang || 'auto',
    tl: targetLang || 'vi',
    dt: 't',
    q: text
  })

  const response = await fetch(`${GOOGLE_TRANSLATE_URL}?${params.toString()}`)

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
}

async function translateViaLibre(text, sourceLang, targetLang) {
  if (!canUseLibreTranslate()) {
    throw new Error('LibreTranslate local rate limit reached')
  }

  const response = await fetch(`${LIBRETRANSLATE_API_URL}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.LIBRETRANSLATE_API_KEY && {
        'Authorization': `Bearer ${process.env.LIBRETRANSLATE_API_KEY}`
      })
    },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    if (response.status === 429) {
      markLibreRateLimited()
    }
    throw new Error(`LibreTranslate API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  if (!data.translatedText) {
    throw new Error('LibreTranslate API returned empty translation')
  }

  if (data.translatedText.trim() === text.trim() && sourceLang !== targetLang) {
    throw new Error('LibreTranslate returned same text as original (translation failed)')
  }

  return data.translatedText
}

/**
 * Translate text using LibreTranslate API
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code (default: 'en')
 * @param {string} targetLang - Target language code (default: 'vi')
 * @returns {Promise<string>} - Translated text
 * @throws {Error} If translation fails
 */
export async function translateText(text, sourceLang = 'en', targetLang = 'vi') {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return ''
  }

  let libreError = null

  try {
    return await translateViaLibre(text, sourceLang, targetLang)
  } catch (error) {
    libreError = error
    console.warn(`⚠️ LibreTranslate failed: ${error.message}. Falling back to Google Translate.`)
  }

  try {
    return await translateViaGoogle(text, sourceLang, targetLang)
  } catch (googleError) {
    console.error('❌ Google Translate fallback failed:', googleError.message)
    throw libreError || googleError
  }
}

/**
 * Translate multiple texts using LibreTranslate API
 * LibreTranslate doesn't support batch, so we translate with delay to avoid rate limiting
 * @param {string[]} texts - Array of texts to translate
 * @param {string} sourceLang - Source language code (default: 'en')
 * @param {string} targetLang - Target language code (default: 'vi')
 * @returns {Promise<string[]>} - Array of translated texts
 * @throws {Error} If translation fails
 */
export async function translateMultiple(texts, sourceLang = 'en', targetLang = 'vi') {
  if (!Array.isArray(texts) || texts.length === 0) {
    return []
  }

  // Filter out empty texts
  const validTexts = texts.filter(t => t && typeof t === 'string' && t.trim() !== '')
  
  if (validTexts.length === 0) {
    return []
  }

  try {
    // Translate with small delay between requests to avoid rate limiting
    // Use sequential translation for public LibreTranslate instance
    const translations = []
    for (let i = 0; i < validTexts.length; i++) {
      try {
        const translation = await translateText(validTexts[i], sourceLang, targetLang)
        translations.push(translation)
        
        // Small delay between requests (100ms) to avoid rate limiting
        if (i < validTexts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error) {
        console.error(`❌ Error translating text ${i + 1}/${validTexts.length}:`, error.message)
        // Use original text as fallback for this item
        translations.push(validTexts[i])
      }
    }

    return translations
  } catch (error) {
    console.error('❌ LibreTranslate batch error:', error.message)
    // Return original texts as fallback
    return validTexts
  }
}

/**
 * Detect language of text
 * @param {string} text - Text to detect language for
 * @returns {Promise<string>} - Detected language code
 */
export async function detectLanguage(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return 'en'
  }

  try {
    const response = await fetch(`${LIBRETRANSLATE_API_URL}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.LIBRETRANSLATE_API_KEY && {
          'Authorization': `Bearer ${process.env.LIBRETRANSLATE_API_KEY}`
        })
      },
      body: JSON.stringify({
        q: text
      })
    })

    if (!response.ok) {
      throw new Error(`LibreTranslate detect API error: ${response.status}`)
    }

    const data = await response.json()
    return data.language || 'en'
  } catch (error) {
    console.error('❌ LibreTranslate detect error:', error.message)
    return 'en' // Default to English
  }
}

/**
 * Get supported languages
 * @returns {Promise<Array>} - Array of supported language objects
 */
export async function getSupportedLanguages() {
  try {
    const response = await fetch(`${LIBRETRANSLATE_API_URL}/languages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`LibreTranslate languages API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('❌ LibreTranslate languages error:', error.message)
    return []
  }
}

