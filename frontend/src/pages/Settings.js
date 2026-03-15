import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Alert, AlertDescription } from '../components/ui/alert';
import { PhotoUploader } from '../components/PhotoUploader';
import { PageLoadingSkeleton } from '../components/LoadingSkeletons';
import { hotelAPI } from '../lib/api';
import { toast } from 'sonner';
import { Save, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    hotelName: '',
    logoUrl: '',
    photos: [],
    videoUrl: '',
    contactPhone: '',
    contactEmail: '',
    notificationEmail: '',
    telegramBotToken: '',
    telegramChatId: '',
    paymentSettings: {
      cryptoEnabled: true,
      payAtPropertyEnabled: false
    }
  });

  useEffect(() => {
    if (user) {
      setSettings({
        hotelName: user.hotelName || '',
        logoUrl: user.logoUrl || '',
        photos: user.photos || [],
        videoUrl: user.videoUrl || '',
        contactPhone: user.contactPhone || '',
        contactEmail: user.contactEmail || '',
        notificationEmail: user.notificationEmail || '',
        telegramBotToken: user.telegramBotToken || '',
        telegramChatId: user.telegramChatId || '',
        paymentSettings: user.paymentSettings || {
          cryptoEnabled: true,
          payAtPropertyEnabled: false
        }
      });
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await hotelAPI.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoadingSkeleton type="wallets" />;
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h2 className="text-2xl font-heading font-semibold">Hotel Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your hotel information and notification preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Information displayed to guests in the widget</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hotelName">Hotel Name *</Label>
              <Input
                id="hotelName"
                value={settings.hotelName}
                onChange={(e) => setSettings({...settings, hotelName: e.target.value})}
                required
                data-testid="settings-hotel-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Hotel Logo</Label>
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                value={settings.logoUrl}
                onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                data-testid="settings-logo-url-input"
              />
              <p className="text-xs text-muted-foreground">Direct URL to your hotel logo (or upload below)</p>
            </div>

            <div className="space-y-2">
              <Label>Hotel Gallery</Label>
              <PhotoUploader
                photos={settings.photos}
                onPhotosChange={(newPhotos) => setSettings({...settings, photos: newPhotos})}
                maxPhotos={8}
              />
              <p className="text-xs text-muted-foreground">Upload up to 8 photos showcasing your hotel</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video Tour URL (YouTube, Vimeo)</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={settings.videoUrl || ''}
                onChange={(e) => setSettings({...settings, videoUrl: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">Link to hotel tour video (optional)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="info@hotel.com"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you receive booking notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notificationEmail">Notification Email</Label>
              <Input
                id="notificationEmail"
                type="email"
                placeholder="notifications@hotel.com"
                value={settings.notificationEmail}
                onChange={(e) => setSettings({...settings, notificationEmail: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">Email where booking notifications will be sent</p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Telegram Integration (Optional)</h4>
              
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  To get instant Telegram notifications:
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Create a bot with @BotFather on Telegram</li>
                    <li>Copy the bot token below</li>
                    <li>Start a chat with your bot and send /start</li>
                    <li>Get your chat ID from @userinfobot</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telegramBotToken">Telegram Bot Token</Label>
                  <Input
                    id="telegramBotToken"
                    type="password"
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={settings.telegramBotToken}
                    onChange={(e) => setSettings({...settings, telegramBotToken: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
                  <Input
                    id="telegramChatId"
                    placeholder="123456789"
                    value={settings.telegramChatId}
                    onChange={(e) => setSettings({...settings, telegramChatId: e.target.value})}
                  />

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Configure which payment options guests can use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Crypto Payment */}
            <div className="flex items-start justify-between gap-4 p-4 border rounded-lg bg-primary/5 border-primary/20">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-base font-semibold">Crypto Payments</Label>
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Accept payments in Bitcoin, Ethereum, Polygon, and 6 other cryptocurrencies. Instant confirmation, zero chargebacks.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• ✅ Instant confirmation & settlement</li>
                  <li>• 🔒 On-chain verification (fraud-proof)</li>
                  <li>• 💸 No chargeback risk</li>
                  <li>• 🌐 Eligible for marketplace transfers</li>
                </ul>
              </div>
              <Switch
                checked={settings.paymentSettings.cryptoEnabled}
                disabled
                data-testid="settings-crypto-enabled-switch"
              />
            </div>

            {/* Pay at Property */}
            <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <Label className="text-base font-semibold">Pay at Property</Label>
                <p className="text-sm text-muted-foreground mt-2 mb-2">
                  Allow guests to pay with card or cash when they check in. Guests must call to confirm booking, or it auto-cancels 48h before arrival.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• 📞 Guest calls to confirm (reduces spam bookings)</li>
                  <li>• ⏰ Auto-cancels if unconfirmed at 48h deadline</li>
                  <li>• 🚫 Not eligible for marketplace transfers</li>
                </ul>
              </div>
              <Switch
                checked={settings.paymentSettings.payAtPropertyEnabled}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  paymentSettings: {
                    ...settings.paymentSettings,
                    payAtPropertyEnabled: checked
                  }
                })}
                data-testid="settings-pay-at-property-enabled-switch"
              />
            </div>

            {settings.paymentSettings.payAtPropertyEnabled && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Important:</strong> Make sure your contact phone number is up-to-date above. Guests will call this number to confirm their bookings.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={saving} 
            data-testid="settings-save-button"
            className="transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
