import { Product } from '../types';

export interface ParsedItem {
  product: Product;
  quantity: number;
  originalText: string;
}

export const parseVoiceOrder = (text: string, availableProducts: Product[]): ParsedItem[] => {
  if (!text || !availableProducts.length) return [];
  
  const normalizedText = text.toLowerCase();
  
  // Basic number mapping for Vietnamese
  const numberMap: { [key: string]: number } = {
    'một': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'năm': 5,
    'sáu': 6, 'bảy': 7, 'tám': 8, 'chín': 9, 'mười': 10,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9, '10': 10
  };

  const items: ParsedItem[] = [];
  
  // Strategy:
  // 1. Split by delimiters like "và", ",", "thêm"
  // 2. Or, simpler for now: Scan for product names in the string. 
  //    If found, look backwards for a number.
  
  // Sort products by name length descending to avoid matching substrings incorrectly
  // (e.g. match "Bún đậu đầy đủ" before "Bún đậu")
  const sortedProducts = [...availableProducts].sort((a, b) => b.name.length - a.name.length);

  let workingText = normalizedText;

  sortedProducts.forEach(product => {
      let productName = product.name.toLowerCase();
      
      // Feature: Create a set of matchable keywords
      // 1. Exact name
      // 2. Name without parens (e.g. "Chả cốm (Thêm)" -> "chả cốm")
      const variations = [productName];
      if (productName.includes('(')) {
          variations.push(productName.replace(/\([^)]*\)/g, '').trim());
      }

      // Try matching any variation
      let matchIndex = -1;
      let matchedVariation = '';

      for (const variation of variations) {
          if (workingText.includes(variation)) {
              matchIndex = workingText.indexOf(variation);
              matchedVariation = variation;
              break; 
          }
      }
      
      if (matchIndex !== -1) {
          // Found a product! Extract surrounding text for quantity.
          // Look BEFORE: "cho anh 2 bún đậu"
          const prefix = workingText.substring(Math.max(0, matchIndex - 15), matchIndex).trim();
          // Look AFTER: "bún đậu 2 suất"
          const suffix = workingText.substring(matchIndex + matchedVariation.length, Math.min(workingText.length, matchIndex + matchedVariation.length + 15)).trim();
          
          let quantity = 1; // Default
          
          const findNumber = (str: string) => {
              const words = str.split(' ');
              // Look at words closest to the product name
              for (let i = 0; i < words.length; i++) {
                   const word = words[i].replace(',', '').replace('.', '');
                   if (numberMap[word]) return numberMap[word];
                   if (!isNaN(parseInt(word))) return parseInt(word);
              }
              return null;
          };

          // Check prefix (last few words)
          const prefixNum = findNumber(prefix.split(' ').reverse().join(' ')); // Reverse to look closest to product
          if (prefixNum) quantity = prefixNum;
          else {
              // Check suffix (first few words)
               const suffixNum = findNumber(suffix);
               if (suffixNum) quantity = suffixNum;
          }
          
          items.push({
              product,
              quantity,
              originalText: matchedVariation
          });

          // Replace found text to prevent double counting
          workingText = workingText.replace(matchedVariation, '___');
      }
  });

  return items;
};
