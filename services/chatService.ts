import { ExtendedSpinelStone, ChatMessage } from '../types';
import { getExportedStones } from './dataService';
import { getVisionGemsSpinelData } from './dataService';
import { APP_MODULES } from '../constants';
import { getAllStatementEntries } from './statementService';
import { getCompanyMetrics } from './companyDashboardService';

const GEMINI_API_KEY = 'AIzaSyBTCzjvQNKwdO_l1_CrNIVuPD7gL9bv_bA';
// Using gemini-2.5-flash as requested
const GEMINI_TEXT_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_VISION_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// System context for the AI
const SYSTEM_CONTEXT = `You are an AI assistant for Vision Gems, a gemstone inventory management system. 
You help users find information about stones, lots, calculate profits, and answer questions about the inventory system.

IMPORTANT: When users ask about stones by code, the system will automatically search the database first. 
Stone codes can be in various formats:
- Standard format: VG-XXX, VG-SPD01*1, VG-OLD-001
- Short codes: Any alphanumeric string (e.g., "efw", "1986", "abc123")
- Numbers: Like "1986", "1234", etc.

When users ask about stones, provide detailed information from all available fields including:
- Stone identification (code, weight, shape, variety, color, etc.)
- Purchase information (cost, date, payment status)
- Sales information (buyer, sell date, price, payment status)
- Financial calculations (profit, commission, etc.)
- Status and location

When asked about profits, calculate: Net Profit = Sales Revenue - Inventory Cost - Expenses.

Common query patterns:
- "find this stone for me [code]" - searches for stone with that code
- "show me stone details for [code]" - shows detailed information
- "what is the information for [code]" - provides complete stone data
- "find stone [code]" - searches and displays results

Be helpful, conversational, and provide clear information.`;

// Extract stone codes from text using regex patterns
export const extractStoneCodes = (text: string): string[] => {
  const patterns = [
    /VG-[A-Z0-9]+(?:\*[0-9]+)?/gi, // VG-XXX or VG-XXX*1
    /VG\.OLD-[0-9]+/gi, // VG.OLD-001
    /[A-Z]{2,}-[A-Z0-9]+/gi, // Generic pattern for codes
  ];

  const codes: string[] = [];
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      codes.push(...matches.map(m => m.toUpperCase()));
    }
  });

  // Remove duplicates
  return [...new Set(codes)];
};

// Search for stones by code(s)
export const searchStonesByCode = (codes: string[]): ExtendedSpinelStone[] => {
  const allStones = getExportedStones();
  const foundStones: ExtendedSpinelStone[] = [];

  codes.forEach(code => {
    // Try exact match first
    let stone = allStones.find(s => 
      s.codeNo?.toUpperCase() === code.toUpperCase()
    );

    // Try partial match if exact not found
    if (!stone) {
      stone = allStones.find(s => 
        s.codeNo?.toUpperCase().includes(code.toUpperCase()) ||
        code.toUpperCase().includes(s.codeNo?.toUpperCase() || '')
      );
    }

    if (stone) {
      foundStones.push(stone);
    }
  });

  return foundStones;
};

// Format stone information for display
export const formatStoneResponse = (stone: ExtendedSpinelStone): string => {
  const formatCurrency = (val: number) => {
    if (!val || val === 0) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return `
**Stone Information: ${stone.codeNo}**

**Section 1: Stone Identification**
- Code No.: ${stone.codeNo || '-'}
- Weight (C & P): ${stone.weight || 0} ct
- Shape: ${stone.shape || '-'}
- Variety: ${stone.variety || '-'}
- Treatment: ${stone.treatment || '-'}
- Color: ${stone.color || '-'}
- Pieces: ${stone.pieces || 0}
- Dimensions: ${stone.dimensions || '-'}

**Section 2: Documentation**
- Certificate: ${stone.certificate || '-'}
- Supplier: ${stone.supplier || '-'}

**Section 3: Purchase Information**
- SL Cost: LKR ${formatCurrency(stone.slCost || 0)}
- Payable: ${typeof stone.payable === 'number' ? `LKR ${formatCurrency(stone.payable)}` : stone.payable || '-'}
- Purchase Date: ${stone.purchaseDate || '-'}
- Payment Method: ${stone.purchasePaymentMethod || '-'}
- Payment Status: ${stone.purchasePaymentStatus || '-'}
- Inventory Category: ${stone.inventoryCategory || '-'}

**Section 4: Status & Location**
- Status: ${stone.status || '-'}
- Location: ${stone.location || '-'}
- Holder: ${stone.holder || '-'}
- Company: ${stone.company || '-'}

**Section 5: Sales Information**
- Outstanding Name: ${stone.outstandingName || '-'}
- Sell Date: ${stone.sellDate || '-'}
- Buyer: ${stone.buyer || '-'}
- Sold By: ${stone.soldBy || '-'}
- Payment Due Date: ${stone.paymentDueDate || '-'}
- Sales Payment Status: ${stone.salesPaymentStatus || '-'}
- Payment Received Date: ${stone.paymentReceivedDate || '-'}
- Selling Price: ${stone.sellingPrice ? `LKR ${formatCurrency(stone.sellingPrice)}` : '-'}

**Section 6: Multi-Currency Pricing**
- Price (RMB): ${formatCurrency(stone.priceRMB || 0)}
- Price (THB): ${formatCurrency(stone.priceTHB || 0)}
- Price (USD): $${formatCurrency(stone.priceUSD || 0)}
- Exchange Rate: ${stone.exchangeRate || 0}

**Section 7: Financial Calculations**
- Amount (LKR): LKR ${formatCurrency(stone.amountLKR || 0)}
- Margin: ${stone.margin || 0}%
- Commission: LKR ${formatCurrency(stone.commission || 0)}
- Final Price: LKR ${formatCurrency(stone.finalPrice || 0)}
- Profit / Loss: LKR ${formatCurrency(stone.profit || 0)}
- Share Amount: LKR ${formatCurrency(stone.shareAmount || 0)}
- Share Profit: LKR ${formatCurrency(stone.shareProfit || 0)}

**Section 8: Payment Tracking**
- Sales Payment Method: ${stone.salesPaymentMethod || '-'}
- Payment Cleared: ${stone.paymentCleared || '-'}
- Transaction Amount: LKR ${formatCurrency(stone.transactionAmount || 0)}
`.trim();
};

// Calculate total expenses from statement entries
export const calculateTotalExpenses = (moduleId?: string, dateRange?: { start?: string; end?: string }): {
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  expensesByModule: Record<string, number>;
  expenseCount: number;
} => {
  const allEntries = getAllStatementEntries();
  
  let filteredEntries = allEntries.filter(entry => entry.debitLKR > 0);
  
  // Filter by module if specified
  if (moduleId) {
    filteredEntries = filteredEntries.filter(entry => entry.moduleId === moduleId);
  }
  
  // Filter by date range if specified
  if (dateRange?.start || dateRange?.end) {
    filteredEntries = filteredEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      if (dateRange.start && entryDate < new Date(dateRange.start)) return false;
      if (dateRange.end && entryDate > new Date(dateRange.end)) return false;
      return true;
    });
  }
  
  let totalExpenses = 0;
  const expensesByCategory: Record<string, number> = {};
  const expensesByModule: Record<string, number> = {};
  
  filteredEntries.forEach(entry => {
    const amount = entry.debitLKR || 0;
    totalExpenses += amount;
    
    // Track by category
    const category = entry.transactionType || 'Other';
    expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
    
    // Track by module
    const module = entry.moduleName || 'Unknown';
    expensesByModule[module] = (expensesByModule[module] || 0) + amount;
  });
  
  return {
    totalExpenses,
    expensesByCategory,
    expensesByModule,
    expenseCount: filteredEntries.length
  };
};

// Calculate total revenue from statement entries
export const calculateTotalRevenue = (moduleId?: string, dateRange?: { start?: string; end?: string }): {
  totalRevenue: number;
  revenueByCategory: Record<string, number>;
  revenueByModule: Record<string, number>;
  revenueCount: number;
} => {
  const allEntries = getAllStatementEntries();
  
  let filteredEntries = allEntries.filter(entry => entry.creditLKR > 0);
  
  // Filter by module if specified
  if (moduleId) {
    filteredEntries = filteredEntries.filter(entry => entry.moduleId === moduleId);
  }
  
  // Filter by date range if specified
  if (dateRange?.start || dateRange?.end) {
    filteredEntries = filteredEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      if (dateRange.start && entryDate < new Date(dateRange.start)) return false;
      if (dateRange.end && entryDate > new Date(dateRange.end)) return false;
      return true;
    });
  }
  
  let totalRevenue = 0;
  const revenueByCategory: Record<string, number> = {};
  const revenueByModule: Record<string, number> = {};
  
  filteredEntries.forEach(entry => {
    const amount = entry.creditLKR || 0;
    totalRevenue += amount;
    
    // Track by category
    const category = entry.transactionType || 'Other';
    revenueByCategory[category] = (revenueByCategory[category] || 0) + amount;
    
    // Track by module
    const module = entry.moduleName || 'Unknown';
    revenueByModule[module] = (revenueByModule[module] || 0) + amount;
  });
  
  return {
    totalRevenue,
    revenueByCategory,
    revenueByModule,
    revenueCount: filteredEntries.length
  };
};

// Get comprehensive financial summary
export const getFinancialSummary = async (moduleId?: string, dateRange?: { start?: string; end?: string }): Promise<{
  totalExpenses: number;
  totalRevenue: number;
  netProfit: number;
  expensesByCategory: Record<string, number>;
  revenueByCategory: Record<string, number>;
  expensesByModule: Record<string, number>;
  revenueByModule: Record<string, number>;
  expenseCount: number;
  revenueCount: number;
}> => {
  const expenses = calculateTotalExpenses(moduleId, dateRange);
  const revenue = calculateTotalRevenue(moduleId, dateRange);
  
  // Also get inventory cost if needed for net profit calculation
  let inventoryCost = 0;
  const stones = getExportedStones();
  stones.forEach(stone => {
    inventoryCost += stone.slCost || 0;
  });
  
  const netProfit = revenue.totalRevenue - expenses.totalExpenses - inventoryCost;
  
  return {
    totalExpenses: expenses.totalExpenses,
    totalRevenue: revenue.totalRevenue,
    netProfit,
    expensesByCategory: expenses.expensesByCategory,
    revenueByCategory: revenue.revenueByCategory,
    expensesByModule: expenses.expensesByModule,
    revenueByModule: revenue.revenueByModule,
    expenseCount: expenses.expenseCount,
    revenueCount: revenue.revenueCount
  };
};

// Calculate profit for a module/tab
export const calculateProfit = async (
  moduleId?: string,
  tabId?: string
): Promise<{
  salesRevenue: number;
  inventoryCost: number;
  expenses: number;
  profit: number;
  netProfit: number;
  moduleId?: string;
  tabId?: string;
}> => {
  let salesRevenue = 0;
  let inventoryCost = 0;

  // Get stones from specified tab or all stones
  const stones = tabId 
    ? await getVisionGemsSpinelData(tabId, moduleId)
    : getExportedStones();

  stones.forEach(stone => {
    const cost = stone.slCost || 0;
    const price = stone.finalPrice || stone.amountLKR || 0;
    const status = stone.status || 'In Stock';

    inventoryCost += cost;

    if (status.toLowerCase().includes('sold')) {
      salesRevenue += price;
    }
  });

  // Get actual expenses from statement entries
  const expenseData = calculateTotalExpenses(moduleId);
  const expenses = expenseData.totalExpenses;
  const profit = salesRevenue - inventoryCost;
  const netProfit = profit - expenses;

  return {
    salesRevenue,
    inventoryCost,
    expenses,
    profit,
    netProfit,
    moduleId,
    tabId
  };
};

// Process image with Gemini Vision API
export const processImage = async (imageBase64: string): Promise<string> => {
  try {
    // Extract MIME type and base64 data from data URL
    let mimeType = 'image/jpeg'; // default
    let base64Data = imageBase64;

    if (imageBase64.includes(',')) {
      const [header, data] = imageBase64.split(',');
      base64Data = data;
      // Extract MIME type from data URL header (e.g., "data:image/png;base64")
      const mimeMatch = header.match(/data:([^;]+)/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    }

    const prompt = `Extract all stone codes from this image. Stone codes typically follow patterns like VG-XXX, VG-SPD01*1, VG-OLD-001, etc. 
Look for any alphanumeric codes that might be stone identifiers. List all codes you find, one per line. 
If you see multiple packets in the image, extract codes from each packet separately.`;

    const response = await fetch(GEMINI_VISION_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return extractedText;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image. Please try again.');
  }
};

// Extract stone code from natural language query using Gemini
export const extractStoneCodeFromQuery = async (query: string): Promise<string | null> => {
  try {
    const extractionPrompt = `You are a stone code extractor for Vision Gems inventory system. 
Your ONLY job is to extract the stone code from the user's query.

User query: "${query}"

Extract the stone code from this query. Stone codes can be:
- Standard format: VG-XXX, VG-SPD01*1, VG-OLD-001
- Short codes: Any alphanumeric string (e.g., "efw", "1986", "abc123")
- Numbers: Like "1986", "1234", etc.

IMPORTANT: 
- Return ONLY the stone code, nothing else
- If no stone code is found, return "NONE"
- Do not return explanations, just the code
- If multiple codes are mentioned, return the first one
- Ignore common words like "for", "the", "this", "me" - these are not codes

Examples:
- "find this stone for me 1986" → "1986"
- "show me stone code efw" → "efw"
- "what is the information for VG-SPD01*1" → "VG-SPD01*1"
- "find stone 123" → "123"
- "hello" → "NONE"

Stone code:`;

    const response = await fetch(GEMINI_TEXT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: extractionPrompt }]
        }]
      })
    });

    if (!response.ok) {
      console.error('[DEBUG] Gemini extraction failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const extracted = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    // Clean up the response - remove any extra text
    const code = extracted.replace(/^[^A-Z0-9]*([A-Z0-9-*]+).*$/i, '$1').trim();
    
    if (!code || code.toUpperCase() === 'NONE' || code.length === 0) {
      return null;
    }

    return code;
  } catch (error) {
    console.error('[DEBUG] Error extracting stone code:', error);
    return null;
  }
};

// Send message to Gemini API
export const sendMessage = async (
  message: string,
  history: ChatMessage[] = []
): Promise<string> => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:244',message:'sendMessage called',data:{messageLength:message.length,historyLength:history.length,apiUrl:'GEMINI_TEXT_API'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
  // #endregion
  try {
    // Build conversation history
    const conversationHistory = history.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Combine system context with user message
    const fullMessage = `${SYSTEM_CONTEXT}\n\nUser: ${message}`;
    
    // Build request body - Gemini API expects contents array with parts
    const requestBody = {
      contents: conversationHistory.length > 0 
        ? [
            ...conversationHistory,
            {
              role: 'user',
              parts: [{ text: fullMessage }]
            }
          ]
        : [
            {
              role: 'user',
              parts: [{ text: fullMessage }]
            }
          ]
    };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:260',message:'Before fetch request',data:{requestBodySize:JSON.stringify(requestBody).length,contentsCount:requestBody.contents.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    console.log('[DEBUG] Sending request to Gemini API:', GEMINI_TEXT_API.substring(0, 100) + '...');
    console.log('[DEBUG] Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(GEMINI_TEXT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    }).catch((fetchError) => {
      console.error('[DEBUG] Fetch error:', fetchError);
      console.error('[DEBUG] Fetch error name:', fetchError?.name);
      console.error('[DEBUG] Fetch error message:', fetchError?.message);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:280',message:'Fetch error caught',data:{errorName:fetchError?.name,errorMessage:fetchError?.message,errorStack:fetchError?.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C,D'})}).catch(()=>{});
      // #endregion
      throw fetchError;
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:295',message:'After fetch - response received',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion
    console.log('[DEBUG] Response status:', response.status, response.statusText);

    if (!response.ok) {
      // #region agent log
      const errorText = await response.text().catch(() => 'Could not read error response');
      console.error('[DEBUG] API Error Response:', errorText);
      fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:300',message:'Response not OK',data:{status:response.status,statusText:response.statusText,errorBody:errorText.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C,E'})}).catch(()=>{});
      // #endregion
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:285',message:'Response parsed successfully',data:{hasCandidates:!!data.candidates,candidatesLength:data.candidates?.length,hasContent:!!data.candidates?.[0]?.content,hasParts:!!data.candidates?.[0]?.content?.parts,hasText:!!data.candidates?.[0]?.content?.parts?.[0]?.text},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response.';

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:287',message:'sendMessage success',data:{replyLength:reply.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion
    return reply;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:310',message:'sendMessage error caught',data:{errorName:error instanceof Error ? error.name : typeof error,errorMessage:error instanceof Error ? error.message : String(error),errorStack:error instanceof Error ? error.stack?.substring(0,500) : undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E,F'})}).catch(()=>{});
    // #endregion
    console.error('[DEBUG] Error sending message:', error);
    console.error('[DEBUG] Error details:', {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Intelligent query parsing and response generation
export const processQuery = async (
  query: string,
  images?: string[]
): Promise<{
  response: string;
  stones?: ExtendedSpinelStone[];
  profitData?: {
    salesRevenue: number;
    inventoryCost: number;
    expenses: number;
    profit: number;
    netProfit: number;
    moduleId?: string;
    tabId?: string;
  };
}> => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:290',message:'processQuery called',data:{query:query.substring(0,100),hasImages:!!images,imageCount:images?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
  // #endregion
  const lowerQuery = query.toLowerCase();

  // Check for image processing
  if (images && images.length > 0) {
    try {
      const allExtractedCodes: string[] = [];

      // Process each image
      for (const image of images) {
        const extractedText = await processImage(image);
        const codes = extractStoneCodes(extractedText);
        allExtractedCodes.push(...codes);
      }

      if (allExtractedCodes.length === 0) {
        return {
          response: "I couldn't find any stone codes in the uploaded image(s). Please make sure the image clearly shows the stone code on the packet."
        };
      }

      // Search for stones
      const foundStones = searchStonesByCode(allExtractedCodes);
      
      if (foundStones.length === 0) {
        return {
          response: `I found the following stone codes in the image: ${allExtractedCodes.join(', ')}\n\nHowever, I couldn't find these codes in the database. Please verify the codes are correct.`
        };
      }

      let responseText = `I found ${foundStones.length} stone(s) from the image:\n\n`;
      foundStones.forEach((stone, idx) => {
        responseText += `\n--- Stone ${idx + 1}: ${stone.codeNo} ---\n`;
        responseText += formatStoneResponse(stone);
        responseText += '\n\n';
      });

      return {
        response: responseText,
        stones: foundStones
      };
    } catch (error) {
      return {
        response: `Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Check for stone code queries - use Gemini to intelligently extract codes first
  // This handles natural language much better than regex
  const geminiExtractedCode = await extractStoneCodeFromQuery(query);
  
  if (geminiExtractedCode) {
    // Gemini found a code, search the database
    let codes = extractStoneCodes(geminiExtractedCode);
    
    // If no patterns matched, use the extracted code directly
    if (codes.length === 0) {
      codes = [geminiExtractedCode.toUpperCase()];
    }

    // Search for stones with these codes
    const stones = searchStonesByCode(codes);
    
    if (stones.length > 0) {
      let responseText = `Found ${stones.length} stone(s) for code: ${geminiExtractedCode}\n\n`;
      stones.forEach((stone, idx) => {
        responseText += `\n--- Stone ${idx + 1}: ${stone.codeNo} ---\n`;
        responseText += formatStoneResponse(stone);
        responseText += '\n\n';
      });
      return {
        response: responseText,
        stones
      };
    } else {
      // Stone not found - provide helpful message
      return {
        response: `I searched for stone code "${geminiExtractedCode}" but couldn't find it in the database. Please verify the code is correct. You can try searching with the full code format (e.g., VG-XXX) or check if the code exists in the system.`
      };
    }
  }

  // Fallback to regex patterns if Gemini extraction didn't find anything
  // This handles edge cases where Gemini might miss something
  const stoneCodePatterns = [
    /(?:code|stone\s+code)\s+(?:is|:)?\s*([A-Za-z0-9-*]+)/i,
    /(?:show|find|get|information|info|details?)\s+(?:me\s+)?(?:the\s+)?(?:stone|details?)\s+(?:for|of|about|with\s+code)?\s*(?:is|:)?\s*([A-Za-z0-9-*]+)/i,
    /(?:stone|code)\s+([A-Za-z0-9-*]+)/i,
  ];

  let extractedCode: string | null = null;
  for (const pattern of stoneCodePatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      const potentialCode = match[1].trim();
      // Skip common words that aren't codes
      if (!['for', 'the', 'this', 'me', 'is', 'of', 'about', 'with'].includes(potentialCode.toLowerCase())) {
        extractedCode = potentialCode;
        break;
      }
    }
  }

  // If regex found a code, search for it
  if (extractedCode) {
    let codes = extractStoneCodes(extractedCode);
    if (codes.length === 0) {
      codes = [extractedCode.toUpperCase()];
    }

    const stones = searchStonesByCode(codes);
    
    if (stones.length > 0) {
      let responseText = `Found ${stones.length} stone(s) for code: ${extractedCode}\n\n`;
      stones.forEach((stone, idx) => {
        responseText += `\n--- Stone ${idx + 1}: ${stone.codeNo} ---\n`;
        responseText += formatStoneResponse(stone);
        responseText += '\n\n';
      });
      return {
        response: responseText,
        stones
      };
    } else {
      return {
        response: `I searched for stone code "${extractedCode}" but couldn't find it in the database. Please verify the code is correct.`
      };
    }
  }

  // Extract module from query if mentioned
  const extractModuleFromQuery = (query: string): string | undefined => {
    const lowerQuery = query.toLowerCase();
    
    // Check for module names and IDs
    for (const module of APP_MODULES) {
      const moduleNameLower = module.name.toLowerCase();
      const moduleIdLower = module.id.toLowerCase();
      
      // Check if module name or ID appears in query
      if (lowerQuery.includes(moduleNameLower) || lowerQuery.includes(moduleIdLower)) {
        return module.id;
      }
      
      // Handle variations like "vision gems sl" -> "vision-gems"
      const moduleNameWords = moduleNameLower.split(/\s+/);
      if (moduleNameWords.length > 1) {
        // Check if all words appear in query (e.g., "vision gems" in "vision gems sl")
        const allWordsMatch = moduleNameWords.every(word => lowerQuery.includes(word));
        if (allWordsMatch) {
          return module.id;
        }
      }
    }
    
    return undefined;
  };

  // Check for expense queries - improved patterns to catch more variations
  const expensePatterns = [
    /(?:total\s+)?expenses?(?:\s+so\s+far)?/i,
    /how\s+much\s+(?:have\s+I\s+)?(?:spent|spend)/i,
    /how\s+much\s+(?:did\s+I\s+)?spend/i,
    /total\s+spending/i,
    /my\s+expenses/i,
    /what\s+(?:are\s+)?(?:my\s+)?expenses/i,
    /show\s+me\s+(?:my\s+)?expenses/i,
    /(?:how\s+much\s+)?(?:have\s+I\s+)?spent/i,
  ];
  
  const isExpenseQuery = expensePatterns.some(pattern => pattern.test(lowerQuery));
  
  if (isExpenseQuery) {
    const moduleId = extractModuleFromQuery(query);
    const expenses = calculateTotalExpenses(moduleId);
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    
    const moduleName = moduleId ? APP_MODULES.find(m => m.id === moduleId)?.name : undefined;
    
    let responseText = `**Total Expenses${moduleName ? ` - ${moduleName}` : ''}: LKR ${formatCurrency(expenses.totalExpenses)}**\n\n`;
    responseText += `Based on ${expenses.expenseCount} expense entries${moduleName ? ` in ${moduleName}` : ' in the system'}.\n\n`;
    
    if (Object.keys(expenses.expensesByCategory).length > 0) {
      responseText += `**Expenses by Category:**\n`;
      Object.entries(expenses.expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, amount]) => {
          responseText += `- ${category}: LKR ${formatCurrency(amount)}\n`;
        });
      responseText += '\n';
    }
    
    // Only show module breakdown if not filtering by specific module
    if (!moduleId && Object.keys(expenses.expensesByModule).length > 0) {
      responseText += `**Expenses by Module:**\n`;
      Object.entries(expenses.expensesByModule)
        .sort(([, a], [, b]) => b - a)
        .forEach(([module, amount]) => {
          responseText += `- ${module}: LKR ${formatCurrency(amount)}\n`;
        });
    }
    
    return { response: responseText };
  }

  // Check for revenue queries - improved patterns
  const revenuePatterns = [
    /(?:total\s+)?(?:revenue|income|sales)(?:\s+so\s+far)?/i,
    /how\s+much\s+(?:have\s+I\s+)?(?:made|make)/i,
    /how\s+much\s+(?:did\s+I\s+)?make/i,
    /total\s+income/i,
    /my\s+(?:revenue|income)/i,
    /what\s+(?:is\s+)?(?:my\s+)?(?:revenue|income)/i,
    /show\s+me\s+(?:my\s+)?(?:revenue|income)/i,
  ];
  
  const isRevenueQuery = revenuePatterns.some(pattern => pattern.test(lowerQuery));
  
  if (isRevenueQuery) {
    const moduleId = extractModuleFromQuery(query);
    const revenue = calculateTotalRevenue(moduleId);
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    
    const moduleName = moduleId ? APP_MODULES.find(m => m.id === moduleId)?.name : undefined;
    
    let responseText = `**Total Revenue${moduleName ? ` - ${moduleName}` : ''}: LKR ${formatCurrency(revenue.totalRevenue)}**\n\n`;
    responseText += `Based on ${revenue.revenueCount} revenue entries${moduleName ? ` in ${moduleName}` : ' in the system'}.\n\n`;
    
    if (Object.keys(revenue.revenueByCategory).length > 0) {
      responseText += `**Revenue by Category:**\n`;
      Object.entries(revenue.revenueByCategory)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, amount]) => {
          responseText += `- ${category}: LKR ${formatCurrency(amount)}\n`;
        });
      responseText += '\n';
    }
    
    // Only show module breakdown if not filtering by specific module
    if (!moduleId && Object.keys(revenue.revenueByModule).length > 0) {
      responseText += `**Revenue by Module:**\n`;
      Object.entries(revenue.revenueByModule)
        .sort(([, a], [, b]) => b - a)
        .forEach(([module, amount]) => {
          responseText += `- ${module}: LKR ${formatCurrency(amount)}\n`;
        });
    }
    
    return { response: responseText };
  }

  // Check for financial summary queries - improved patterns
  const financialSummaryPatterns = [
    /(?:financial\s+)?(?:summary|overview)/i,
    /how\s+am\s+I\s+doing\s+financially/i,
    /financial\s+status/i,
    /financial\s+report/i,
    /show\s+me\s+(?:my\s+)?(?:financial|finance)/i,
  ];
  
  const isFinancialSummaryQuery = financialSummaryPatterns.some(pattern => pattern.test(lowerQuery));
  
  if (isFinancialSummaryQuery) {
    const moduleId = extractModuleFromQuery(query);
    const summary = await getFinancialSummary(moduleId);
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    
    const moduleName = moduleId ? APP_MODULES.find(m => m.id === moduleId)?.name : undefined;
    
    let responseText = `**Financial Summary${moduleName ? ` - ${moduleName}` : ''}**\n\n`;
    responseText += `**Total Revenue:** LKR ${formatCurrency(summary.totalRevenue)}\n`;
    responseText += `**Total Expenses:** LKR ${formatCurrency(summary.totalExpenses)}\n`;
    responseText += `**Net Profit:** LKR ${formatCurrency(summary.netProfit)}\n\n`;
    
    responseText += `Based on ${summary.revenueCount} revenue entries and ${summary.expenseCount} expense entries${moduleName ? ` in ${moduleName}` : ' in the system'}.\n\n`;
    
    if (Object.keys(summary.expensesByCategory).length > 0) {
      responseText += `**Top Expense Categories:**\n`;
      Object.entries(summary.expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([category, amount]) => {
          responseText += `- ${category}: LKR ${formatCurrency(amount)}\n`;
        });
      responseText += '\n';
    }
    
    if (Object.keys(summary.revenueByCategory).length > 0) {
      responseText += `**Top Revenue Categories:**\n`;
      Object.entries(summary.revenueByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([category, amount]) => {
          responseText += `- ${category}: LKR ${formatCurrency(amount)}\n`;
        });
    }
    
    return { response: responseText };
  }

  // Check for profit queries
  const profitPattern = /(?:profit|revenue|sales|income|loss|earnings?|how much.*profit|what.*profit)/i;
  if (profitPattern.test(lowerQuery)) {
    // Try to extract module/tab from query
    let moduleId: string | undefined;
    let tabId: string | undefined;

    // Check for module names
    const module = APP_MODULES.find(m => 
      lowerQuery.includes(m.name.toLowerCase()) || 
      lowerQuery.includes(m.id.toLowerCase())
    );
    if (module) {
      moduleId = module.id;
    }

    // Check for tab names (common ones)
    const tabKeywords = ['spinel', 'ruby', 'sapphire', 'garnet', 'dashboard'];
    for (const keyword of tabKeywords) {
      if (lowerQuery.includes(keyword)) {
        tabId = keyword;
        break;
      }
    }

    const profitData = await calculateProfit(moduleId, tabId);
    
    const responseText = `**Profit Analysis${moduleId ? ` - ${APP_MODULES.find(m => m.id === moduleId)?.name || moduleId}` : ''}${tabId ? ` - ${tabId}` : ''}**

- Sales Revenue: LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profitData.salesRevenue)}
- Inventory Cost: LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profitData.inventoryCost)}
- Expenses: LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profitData.expenses)}
- Gross Profit: LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profitData.profit)}
- Net Profit: LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profitData.netProfit)}`;

    return {
      response: responseText,
      profitData
    };
  }

  // General question - use Gemini API
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:500',message:'Taking general question path - calling sendMessage',data:{query:query.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
  // #endregion
  try {
    const response = await sendMessage(query, []);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:503',message:'sendMessage returned successfully',data:{responseLength:response.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
    // #endregion
    return { response };
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.ts:506',message:'processQuery error caught',data:{errorName:error instanceof Error ? error.name : typeof error,errorMessage:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E,F'})}).catch(()=>{});
    // #endregion
    return {
      response: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try rephrasing your question or check if the stone code is correct.`
    };
  }
};

