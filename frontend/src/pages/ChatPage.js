import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Send, 
  Sparkles, 
  X, 
  Maximize2, 
  Home,
  MapPin,
  DollarSign,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Bitsy, your AI booking assistant. 🏨\n\nI'll help you find the perfect crypto-accepting hotel. Just tell me where and when you'd like to stay, and I'll handle everything!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call backend chat API
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        })
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();

      // Add AI response
      const aiMessage = {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: data.response,
        hotels: data.hotels || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // If hotels are returned, show in side panel
      if (data.hotels && data.hotels.length > 0) {
        setSelectedHotel(data.hotels[0]);
        setShowSidePanel(true);
      }
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30" data-testid="chat-page">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="chat-home-link">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-heading font-bold text-xl">Bitsy</span>
          </Link>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Powered
          </Badge>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-4rem)]">
        <div className={`grid h-full gap-6 transition-all duration-300 ${
          showSidePanel ? 'lg:grid-cols-[1fr_400px]' : 'lg:grid-cols-1'
        }`}>
          {/* Chat Interface */}
          <Card className="flex flex-col h-full rounded-2xl border-2 shadow-xl overflow-hidden" data-testid="chat-container">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                    data-testid={`message-${message.id}`}
                  >
                    {/* Avatar */}
                    <Avatar className={`w-8 h-8 flex items-center justify-center ${
                      message.role === 'assistant' 
                        ? 'bg-primary text-white' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {message.role === 'assistant' ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-semibold">Y</span>
                      )}
                    </Avatar>

                    {/* Message Bubble */}
                    <div className={`flex-1 space-y-2 ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}>
                      <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      </div>

                      {/* Hotel Cards in Chat */}
                      {message.hotels && message.hotels.length > 0 && (
                        <div className="space-y-3 w-full mt-3">
                          {message.hotels.map((hotel, idx) => (
                            <Card 
                              key={idx}
                              className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
                              onClick={() => {
                                setSelectedHotel(hotel);
                                setShowSidePanel(true);
                              }}
                              data-testid={`hotel-card-${idx}`}
                            >
                              <div className="flex gap-4">
                                {hotel.image && (
                                  <div className="w-24 h-24 rounded-lg bg-slate-200 flex-shrink-0 overflow-hidden">
                                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-heading font-semibold text-base">{hotel.name}</h3>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {hotel.location}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-sm font-semibold text-primary">
                                      From ${hotel.price}/night
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {hotel.rooms} rooms available
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" className="w-full mt-3" data-testid={`book-hotel-${idx}`}>
                                View Details & Book
                              </Button>
                            </Card>
                          ))}
                        </div>
                      )}

                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex items-center justify-center bg-primary text-white">
                      <Sparkles className="h-4 w-4" />
                    </Avatar>
                    <div className="bg-slate-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <div className="max-w-3xl mx-auto flex gap-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me where you'd like to stay..."
                  className="flex-1 text-base"
                  disabled={isLoading}
                  data-testid="chat-input"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-10 w-10"
                  data-testid="chat-send-button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Bitsy AI can search hotels, check availability, and complete bookings for you
              </p>
            </div>
          </Card>

          {/* Side Panel for Hotel Details */}
          {showSidePanel && selectedHotel && (
            <Card className="hidden lg:flex flex-col h-full rounded-2xl border-2 shadow-xl overflow-hidden" data-testid="hotel-side-panel">
              {/* Panel Header */}
              <div className="border-b bg-slate-50 p-4 flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg">Hotel Details</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidePanel(false)}
                  data-testid="close-side-panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Panel Content */}
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {/* Hotel Image */}
                  {selectedHotel.image && (
                    <div className="relative aspect-video rounded-xl overflow-hidden group">
                      <img 
                        src={selectedHotel.image} 
                        alt={selectedHotel.name}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid="expand-image-button"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Hotel Info */}
                  <div>
                    <h3 className="font-heading font-bold text-2xl">{selectedHotel.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                      <MapPin className="h-4 w-4" />
                      {selectedHotel.location}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Starting From</p>
                      <p className="text-xl font-bold text-primary mt-1">${selectedHotel.price}/night</p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="text-xl font-bold mt-1">{selectedHotel.rooms} rooms</p>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedHotel.description && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">About</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedHotel.description}
                      </p>
                    </div>
                  )}

                  {/* Amenities */}
                  {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedHotel.amenities.map((amenity, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Photo Gallery */}
                  {selectedHotel.photos && selectedHotel.photos.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Photos ({selectedHotel.photos.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedHotel.photos.map((photo, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-200">
                            <img src={photo} alt={`${selectedHotel.name} ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Book Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      setInput(`I'd like to book ${selectedHotel.name}`);
                      inputRef.current?.focus();
                    }}
                    data-testid="book-from-side-panel"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Continue Booking
                  </Button>
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Suggestions (when no messages) */}
      {messages.length === 1 && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: MapPin, text: 'Hotels in Miami', query: 'Find me hotels in Miami' },
              { icon: DollarSign, text: 'Under $200/night', query: 'Show me hotels under $200 per night' },
              { icon: Calendar, text: 'This weekend', query: 'I need a hotel this weekend' },
              { icon: Home, text: 'Luxury stays', query: 'Show me luxury hotels' }
            ].map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-auto py-3 px-4 flex flex-col items-start gap-2 bg-white hover:bg-slate-50 hover:border-primary/50"
                onClick={() => setInput(suggestion.query)}
                data-testid={`suggestion-${idx}`}
              >
                <suggestion.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
