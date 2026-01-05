import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Bot, User, Loader2, Camera } from 'lucide-react';
import { ChatMessage, ExtendedSpinelStone } from '../types';
import { processQuery } from '../services/chatService';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for Vision Gems. I can help you:\n\n• Find information about stones by code\n• Calculate profits for modules or tabs\n• Process images of stone packets to extract codes\n• Answer questions about the inventory system\n\nHow can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        newImages.push(base64);
        if (newImages.length === files.length) {
          setSelectedImages(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const formatCurrency = (val: number) => {
    if (!val || val === 0) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const handleSend = async () => {
    if (!inputValue.trim() && selectedImages.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim() || 'Process these images',
      timestamp: new Date(),
      images: selectedImages.length > 0 ? [...selectedImages] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    const imagesToProcess = [...selectedImages];
    setSelectedImages([]);
    setIsLoading(true);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.tsx:76',message:'handleSend - calling processQuery',data:{content:userMessage.content.substring(0,100),imageCount:imagesToProcess.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
    // #endregion
    try {
      const result = await processQuery(userMessage.content, imagesToProcess.length > 0 ? imagesToProcess : undefined);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.tsx:79',message:'processQuery returned successfully',data:{responseLength:result.response.length,hasStones:!!result.stones,hasProfitData:!!result.profitData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
      // #endregion

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        stoneData: result.stones,
        profitData: result.profitData
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.tsx:89',message:'handleSend error caught',data:{errorName:error instanceof Error ? error.name : typeof error,errorMessage:error instanceof Error ? error.message : String(error),errorStack:error instanceof Error ? error.stack?.substring(0,500) : undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E,F'})}).catch(()=>{});
      // #endregion
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderStoneCard = (stone: ExtendedSpinelStone) => {
    return (
      <div key={stone.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 md:p-6 my-4">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
          <h3 className="text-lg font-bold text-gem-purple">{stone.codeNo}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            stone.status === 'Sold' ? 'bg-green-100 text-green-700' :
            stone.status === 'In Stock' ? 'bg-blue-100 text-blue-700' :
            'bg-stone-100 text-stone-700'
          }`}>
            {stone.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stone Identification */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Stone Identification</h4>
            <div className="text-sm space-y-1">
              <div><span className="font-semibold">Weight:</span> {stone.weight || 0} ct</div>
              <div><span className="font-semibold">Shape:</span> {stone.shape || '-'}</div>
              <div><span className="font-semibold">Variety:</span> {stone.variety || '-'}</div>
              <div><span className="font-semibold">Color:</span> {stone.color || '-'}</div>
              <div><span className="font-semibold">Pieces:</span> {stone.pieces || 0}</div>
            </div>
          </div>

          {/* Purchase Information */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Purchase Information</h4>
            <div className="text-sm space-y-1">
              <div><span className="font-semibold">SL Cost:</span> LKR {formatCurrency(stone.slCost || 0)}</div>
              <div><span className="font-semibold">Purchase Date:</span> {stone.purchaseDate || '-'}</div>
              <div><span className="font-semibold">Payment Status:</span> {stone.purchasePaymentStatus || '-'}</div>
              <div><span className="font-semibold">Supplier:</span> {stone.supplier || '-'}</div>
            </div>
          </div>

          {/* Sales Information */}
          {stone.status === 'Sold' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Sales Information</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-semibold">Buyer:</span> {stone.buyer || '-'}</div>
                <div><span className="font-semibold">Sell Date:</span> {stone.sellDate || '-'}</div>
                <div><span className="font-semibold">Final Price:</span> LKR {formatCurrency(stone.finalPrice || 0)}</div>
                <div><span className="font-semibold">Payment Status:</span> {stone.salesPaymentStatus || '-'}</div>
              </div>
            </div>
          )}

          {/* Financial Calculations */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Financial</h4>
            <div className="text-sm space-y-1">
              <div><span className="font-semibold">Amount (LKR):</span> LKR {formatCurrency(stone.amountLKR || 0)}</div>
              <div><span className="font-semibold">Profit/Loss:</span> LKR {formatCurrency(stone.profit || 0)}</div>
              <div><span className="font-semibold">Commission:</span> LKR {formatCurrency(stone.commission || 0)}</div>
              {stone.priceUSD > 0 && (
                <div><span className="font-semibold">Price (USD):</span> ${formatCurrency(stone.priceUSD || 0)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Photos */}
        {stone.photos && stone.photos.length > 0 && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Photos</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {stone.photos.map((photo, idx) => (
                <img key={idx} src={photo} alt={`Stone ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProfitCard = (profitData: NonNullable<ChatMessage['profitData']>) => {
    return (
      <div className="bg-gradient-to-br from-gem-purple/10 to-indigo-50 rounded-2xl border border-gem-purple/20 shadow-sm p-4 md:p-6 my-4">
        <h3 className="text-lg font-bold text-gem-purple mb-4">Profit Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-stone-200">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Sales Revenue</div>
            <div className="text-2xl font-black text-green-600">LKR {formatCurrency(profitData.salesRevenue)}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-200">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Inventory Cost</div>
            <div className="text-2xl font-black text-red-600">LKR {formatCurrency(profitData.inventoryCost)}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-200">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Expenses</div>
            <div className="text-2xl font-black text-orange-600">LKR {formatCurrency(profitData.expenses)}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gem-purple/30">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Net Profit</div>
            <div className={`text-2xl font-black ${profitData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              LKR {formatCurrency(profitData.netProfit)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-stone-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-8 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gem-purple to-indigo-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-800">AI Assistant</h1>
            <p className="text-xs text-stone-500">Ask questions about stones, profits, and more</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gem-purple to-indigo-600 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
            )}

            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gem-purple text-white'
                  : 'bg-white border border-stone-200 text-stone-800'
              }`}
            >
              {/* User images */}
              {message.images && message.images.length > 0 && (
                <div className="mb-2 grid grid-cols-2 gap-2">
                  {message.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  ))}
                </div>
              )}

              {/* Message content */}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>

              {/* Stone data */}
              {message.stoneData && message.stoneData.length > 0 && (
                <div className="mt-4">
                  {message.stoneData.map(stone => renderStoneCard(stone))}
                </div>
              )}

              {/* Profit data */}
              {message.profitData && renderProfitCard(message.profitData)}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                <User size={16} className="text-stone-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gem-purple to-indigo-600 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3">
              <Loader2 size={16} className="animate-spin text-gem-purple" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="px-4 md:px-8 py-2 bg-white border-t border-stone-200 shrink-0">
          <div className="flex gap-2 overflow-x-auto">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative shrink-0">
                <img src={img} alt={`Selected ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border border-stone-200" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-stone-200 px-4 md:px-8 py-4 shrink-0 relative z-20">
        <div className="flex gap-2 items-end">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-stone-500 hover:text-gem-purple hover:bg-stone-100 rounded-xl transition-colors shrink-0"
            title="Upload images"
          >
            <Camera size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or upload images of stone packets..."
            className="flex-1 min-h-[44px] max-h-32 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gem-purple/20 focus:border-gem-purple resize-none relative z-10"
            rows={1}
            disabled={isLoading}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (!inputValue.trim() && selectedImages.length === 0)}
            className="p-2 bg-gem-purple text-white rounded-xl hover:bg-gem-purple-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

