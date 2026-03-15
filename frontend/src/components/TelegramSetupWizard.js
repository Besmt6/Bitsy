import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TelegramSetupWizard = ({ currentToken, currentChatId, onComplete }) => {
  const [step, setStep] = useState(1);
  const [botToken, setBotToken] = useState(currentToken || '');
  const [chatId, setChatId] = useState(currentChatId || '');
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleTestBot = async () => {
    if (!botToken) {
      toast.error('Please enter your bot token');
      return;
    }

    setTesting(true);
    setTestSuccess(false);

    try {
      // Test bot token by calling Telegram API
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await response.json();

      if (data.ok) {
        setTestSuccess(true);
        toast.success(`Bot connected: @${data.result.username}`);
        setStep(3);
      } else {
        toast.error('Invalid bot token. Please check and try again.');
      }
    } catch (error) {
      toast.error('Failed to test bot token');
    } finally {
      setTesting(false);
    }
  };

  const handleTestChatId = async () => {
    if (!chatId) {
      toast.error('Please enter your chat ID');
      return;
    }

    setTesting(true);

    try {
      // Send test message
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ Telegram notifications connected! You\'ll receive booking alerts here.'
        })
      });

      const data = await response.json();

      if (data.ok) {
        toast.success('Test message sent! Check your Telegram.');
        setStep(4);
      } else {
        toast.error('Invalid chat ID or bot not started');
      }
    } catch (error) {
      toast.error('Failed to send test message');
    } finally {
      setTesting(false);
    }
  };

  const handleComplete = () => {
    onComplete({ botToken, chatId });
    toast.success('Telegram notifications enabled!');
  };

  return (
    <div className="space-y-4" data-testid="telegram-setup-wizard">
      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((num) => (
          <React.Fragment key={num}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
              step >= num ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {step > num ? <CheckCircle2 className="h-4 w-4" /> : num}
            </div>
            {num < 4 && <div className={`flex-1 h-1 ${
              step > num ? 'bg-primary' : 'bg-muted'
            }`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Introduction */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Setup Telegram Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get instant booking alerts on Telegram! We'll guide you through the setup in 3 easy steps.
            </p>
            
            <div className="space-y-2 text-sm">
              <p className="font-medium">What you'll need:</p>
              <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                <li>Telegram app (on phone or desktop)</li>
                <li>5 minutes of your time</li>
              </ul>
            </div>

            <Button onClick={() => setStep(2)} className="w-full" data-testid="telegram-wizard-start-button">
              Start Setup
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Create Bot */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 1: Create Your Bot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Follow these steps in Telegram:</strong>
                <ol className="list-decimal ml-4 mt-2 space-y-2">
                  <li>Open Telegram and search for <Badge variant="secondary" className="font-mono">@BotFather</Badge></li>
                  <li>Send the command: <code className="bg-muted px-2 py-0.5 rounded">/newbot</code></li>
                  <li>Choose a name (e.g., "Ocean View Bookings")</li>
                  <li>Choose a username (e.g., "oceanview_bookings_bot")</li>
                  <li>Copy the <strong>bot token</strong> (looks like: 123456789:ABCdef...)</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="botToken">Paste Your Bot Token</Label>
              <Input
                id="botToken"
                type="password"
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                data-testid="telegram-wizard-token-input"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleTestBot}
                disabled={!botToken || testing}
                className="flex-1"
                data-testid="telegram-wizard-test-token-button"
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test & Continue'
                )}
              </Button>
            </div>

            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              Open @BotFather in Telegram
              <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Get Chat ID */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 2: Get Your Chat ID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-success/10 border-success/30">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Bot token verified! ✓
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Follow these steps in Telegram:</strong>
                <ol className="list-decimal ml-4 mt-2 space-y-2">
                  <li>Search for your bot and send <code className="bg-muted px-2 py-0.5 rounded">/start</code></li>
                  <li>Search for <Badge variant="secondary" className="font-mono">@userinfobot</Badge></li>
                  <li>Send any message to @userinfobot</li>
                  <li>Copy your <strong>ID number</strong> (looks like: 123456789)</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="chatId">Paste Your Chat ID</Label>
              <Input
                id="chatId"
                type="text"
                placeholder="123456789"
                value={chatId}
                onChange={(e) => setChatId(e.target.value.replace(/\D/g, ''))}
                data-testid="telegram-wizard-chatid-input"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleTestChatId}
                disabled={!chatId || testing}
                className="flex-1"
                data-testid="telegram-wizard-test-chatid-button"
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Test...
                  </>
                ) : (
                  'Send Test Message'
                )}
              </Button>
            </div>

            <a
              href="https://t.me/userinfobot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              Open @userinfobot in Telegram
              <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Set! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-success/10 border-success/30">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Telegram notifications are now active! You'll receive instant alerts for all new bookings.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <p className="font-medium">Connected:</p>
              <div className="space-y-1 text-muted-foreground">
                <p>• Bot Token: ••••••{botToken.slice(-6)}</p>
                <p>• Chat ID: {chatId}</p>
              </div>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full"
              data-testid="telegram-wizard-complete-button"
            >
              Save & Finish
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TelegramSetupWizard;
