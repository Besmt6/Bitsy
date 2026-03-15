import React from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { MessageCircle, Send, X } from 'lucide-react';

const WidgetMockup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-8">
      {/* Simulated Website Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 text-6xl font-bold text-slate-400">Hotel Website</div>
        <div className="absolute top-40 left-20 w-64 h-4 bg-slate-300 rounded"></div>
        <div className="absolute top-48 left-20 w-96 h-4 bg-slate-300 rounded"></div>
      </div>

      {/* Bitsy Widget (Open) */}
      <div className="relative z-10" style={{ transform: 'scale(1.2)' }}>
        <Card className="w-[380px] shadow-2xl border-2 border-primary/20 overflow-hidden">
          {/* Widget Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-heading font-bold text-lg">B</span>
              </div>
              <div>
                <div className="font-semibold">Bitsy AI Assistant</div>
                <div className="text-xs opacity-90">Test Hotel Photo Upload</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="bg-background p-4 h-[420px] overflow-y-auto space-y-3">
            {/* AI Message 1 */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                  <p className="text-sm">Hi! 👋 I'm Bitsy, your AI booking assistant. How can I help you today?</p>
                </div>
              </div>
            </div>

            {/* User Message 1 */}
            <div className="flex gap-3 justify-end">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3 max-w-[80%]">
                <p className="text-sm">I need a room for 2 nights starting tomorrow</p>
              </div>
            </div>

            {/* AI Message 2 */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                  <p className="text-sm mb-3">Perfect! Here are our available rooms:</p>
                  
                  {/* Room Options */}
                  <div className="space-y-2">
                    <div className="bg-background border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm">Ocean View Suite</span>
                        <span className="font-bold text-primary">$299/night</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Luxury suite with panoramic ocean views</p>
                    </div>
                    
                    <div className="bg-background border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm">Deluxe Suite</span>
                        <span className="font-bold text-primary">$199/night</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Ocean view with king bed</p>
                    </div>
                  </div>
                  
                  <p className="text-sm mt-3">Total for 2 nights: <span className="font-bold text-lg text-primary">$598</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Which room would you like to book?</p>
                </div>
              </div>
            </div>

            {/* User Message 2 */}
            <div className="flex gap-3 justify-end">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3">
                <p className="text-sm">I'll take the Deluxe Suite!</p>
              </div>
            </div>

            {/* AI Message 3 */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                  <p className="text-sm mb-3">Great choice! 🎉 Just need a few details:</p>
                  
                  {/* Booking Form Mockup */}
                  <div className="bg-background rounded-lg p-3 space-y-2">
                    <Input placeholder="Your name" className="h-9 text-sm" defaultValue="Sarah Johnson" />
                    <Input placeholder="Email" className="h-9 text-sm" defaultValue="sarah@email.com" />
                    <Input placeholder="Phone" className="h-9 text-sm" defaultValue="+1 555-0123" />
                    
                    <div className="pt-2">
                      <Button className="w-full h-9 text-sm">
                        Choose Payment Method
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-background">
            <div className="flex gap-2">
              <Input 
                placeholder="Type your message..." 
                className="flex-1"
                disabled
              />
              <Button size="icon" className="flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-center">
              <span className="text-[10px] text-muted-foreground">Powered by Bitsy</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WidgetMockup;
