import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { hotelAPI } from '../lib/api';
import { toast } from 'sonner';
import { Copy, Code, Eye, AlertCircle, CheckCircle } from 'lucide-react';

const Widget = () => {
  const [loading, setLoading] = useState(true);
  const [embedCode, setEmbedCode] = useState('');
  const [hotelId, setHotelId] = useState('');

  useEffect(() => {
    fetchWidgetCode();
  }, []);

  const fetchWidgetCode = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getWidgetCode();
      setEmbedCode(response.data.embedCode);
      setHotelId(response.data.hotelId);
    } catch (error) {
      console.error('Failed to fetch widget code:', error);
      toast.error('Failed to load widget code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success('Widget code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-semibold">Embed Widget</h2>
        <p className="text-muted-foreground mt-1">Add Bitsy to your hotel website</p>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList>
          <TabsTrigger value="code">
            <Code className="h-4 w-4 mr-2" />
            Embed Code
          </TabsTrigger>
          <TabsTrigger value="instructions">
            <Eye className="h-4 w-4 mr-2" />
            Instructions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>Widget Embed Code</CardTitle>
              <CardDescription>
                Copy and paste this code into your website's HTML, just before the closing &lt;/body&gt; tag
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="embedCode">Embed Code</Label>
                <div className="relative">
                  <Textarea
                    id="embedCode"
                    value={embedCode}
                    readOnly
                    className="font-mono text-sm h-24 pr-12"
                    data-testid="embed-code-snippet"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={copyToClipboard}
                    data-testid="embed-code-copy-button"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Your Hotel ID:</strong> <code className="font-mono text-xs">{hotelId}</code>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Privacy Note:</strong> Bitsy never stores guest personal information. All booking data is sent directly to you via notifications.
                  <br />
                  <strong>Non-Refundable Policy:</strong> The widget clearly displays that all crypto bookings are final and non-refundable.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>How to Add Bitsy to Your Website</CardTitle>
              <CardDescription>Follow these simple steps to integrate the booking widget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Copy the embed code</h4>
                    <p className="text-sm text-muted-foreground">Click the "Copy" button in the Embed Code tab</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Open your website's HTML</h4>
                    <p className="text-sm text-muted-foreground">Access your website's source code or content management system</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Paste before closing &lt;/body&gt; tag</h4>
                    <p className="text-sm text-muted-foreground">Add the script just before the &lt;/body&gt; tag on pages where you want the widget</p>
                    <div className="mt-2 p-3 bg-muted rounded-lg font-mono text-xs">
                      &lt;body&gt;<br />
                      &nbsp;&nbsp;...<br />
                      &nbsp;&nbsp;<span className="text-primary">&lt;!-- Bitsy Widget --&gt;</span><br />
                      &nbsp;&nbsp;<span className="text-accent">{embedCode}</span><br />
                      &lt;/body&gt;
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">4</div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Save and publish</h4>
                    <p className="text-sm text-muted-foreground">The Bitsy chat button will appear on your website automatically</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] rounded-full flex items-center justify-center font-bold">✓</div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">You're all set!</h4>
                    <p className="text-sm text-muted-foreground">Guests can now book rooms and pay with cryptocurrency directly on your website</p>
                  </div>
                </div>
              </div>

              <Alert className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Need help?</strong> Make sure you've:
                  <ul className="list-disc ml-4 mt-2 text-xs space-y-1">
                    <li>Added at least one room type in the Rooms section</li>
                    <li>Configured at least one crypto wallet address</li>
                    <li>Set up your hotel information in Settings</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Widget Preview</CardTitle>
          <CardDescription>This is how the Bitsy button will appear on your website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 border border-border rounded-2xl p-8 min-h-[300px] relative">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Your website content will appear here...</p>
            </div>
            
            {/* Widget Button Preview */}
            <div className="fixed bottom-4 right-4">
              <button className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Guests will click this button to start booking with Bitsy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Widget;
