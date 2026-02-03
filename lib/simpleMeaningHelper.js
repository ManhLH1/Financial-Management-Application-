/**
 * Simple Meaning Helper
 * Creates short, concise Vietnamese meanings for vocabulary words
 * Used for quick reference and flashcards
 */

/**
 * Create a simple, concise meaning from definition
 * @param {string} word - The word
 * @param {string} vietnameseDefinition - Vietnamese definition
 * @param {string} englishDefinition - English definition (for reference)
 * @param {string} partOfSpeech - Part of speech (noun, verb, etc.)
 * @returns {string} - Simple, concise meaning
 */
export function createSimpleMeaning(word, vietnameseDefinition, englishDefinition, partOfSpeech) {
  // If we have Vietnamese definition, extract first sentence or first 50 chars
  if (vietnameseDefinition && vietnameseDefinition.trim()) {
    // Take first sentence (before period, exclamation, or question mark)
    const firstSentence = vietnameseDefinition.split(/[.!?]/)[0].trim()
    
    // If first sentence is reasonable length (less than 100 chars), use it
    if (firstSentence.length > 0 && firstSentence.length < 100) {
      return firstSentence
    }
    
    // Otherwise, take first 50 characters
    if (vietnameseDefinition.length > 50) {
      return vietnameseDefinition.substring(0, 50) + '...'
    }
    
    return vietnameseDefinition
  }
  
  // Fallback to English if no Vietnamese
  if (englishDefinition && englishDefinition.trim()) {
    const firstSentence = englishDefinition.split(/[.!?]/)[0].trim()
    if (firstSentence.length > 0 && firstSentence.length < 100) {
      return firstSentence
    }
    if (englishDefinition.length > 50) {
      return englishDefinition.substring(0, 50) + '...'
    }
    return englishDefinition
  }
  
  // Last resort: return word itself
  return word
}

