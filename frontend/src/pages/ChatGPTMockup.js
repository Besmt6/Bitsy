import React from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Sparkles, MapPin, DollarSign, Wallet, ExternalLink } from 'lucide-react';

const ChatGPTMockup = () => {
  return (
    <div className="min-h-screen bg-[#343541] flex items-center justify-center p-8">
      {/* ChatGPT Interface */}
      <div className="w-full max-w-4xl">
        {/* ChatGPT Header */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-xl font-semibold">ChatGPT</span>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            GPT-4o
          </Badge>
        </div>

        {/* Conversation */}
        <div className="space-y-6">
          {/* User Message */}
          <div className="flex gap-4 px-4">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-sm font-bold">U</span>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-white text-base">
                Find me hotels that accept cryptocurrency payments
              </p>
            </div>
          </div>

          {/* ChatGPT Response */}
          <div className="flex gap-4 px-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex-shrink-0 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-base leading-relaxed mb-4">
                I found several crypto-friendly hotels via Bitsy's network. Here's one that stands out:
              </p>

              {/* Hotel Card in ChatGPT */}
              <Card className="bg-[#444654] border-[#565869] p-5 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white text-xl font-heading font-bold mb-1">
                      Test Hotel Photo Upload
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>Available for booking</span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    MCP Verified
                  </Badge>
                </div>

                {/* Room Options */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">🛏️ Ocean View Suite</span>
                    <span className="text-white font-semibold">$299/night</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">🛏️ Deluxe Suite</span>
                    <span className="text-white font-semibold">$199/night</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">🛏️ Standard Double</span>
                    <span className="text-white font-semibold">$129/night</span>
                  </div>
                </div>

                {/* Crypto Payment Info */}
                <div className="bg-[#343541] rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="h-4 w-4 text-cyan-400" />
                    <span className="text-white font-semibold text-sm">Crypto Payments Accepted</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">Ethereum</Badge>
                    <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">Polygon</Badge>
                    <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">Base</Badge>
                    <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-300">Bitcoin</Badge>
                    <Badge variant="outline" className="text-xs border-pink-500/30 text-pink-300">Arbitrum</Badge>
                    <Badge variant="outline" className="text-xs border-red-500/30 text-red-300">Optimism</Badge>
                  </div>
                </div>

                {/* Book Button */}
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-12">
                  Book on Bitsy
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Card>

              <p className="text-gray-400 text-sm leading-relaxed">
                This hotel is part of Bitsy's zero-commission platform. You can book directly and pay with cryptocurrency across 6 blockchains. The AI booking assistant is available 24/7 on their website.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="h-3 w-3" />
                <span>Powered by Model Context Protocol (MCP)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ChatGPT Input Area */}
        <div className="px-4 pt-6">
          <div className="bg-[#40414f] rounded-xl p-4 border border-[#565869]">
            <input 
              type="text" 
              placeholder="Message ChatGPT..." 
              className="w-full bg-transparent text-white placeholder-gray-500 outline-none"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-8 right-8 text-sm text-gray-500">
        Demo: ChatGPT discovering Bitsy hotels via MCP
      </div>
    </div>
  );
};

export default ChatGPTMockup;
