import React from 'react';
import { Card, CardContent } from './ui/card';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export const PaymentMethodComparison = ({ variant = 'full' }) => {
  const cryptoBenefits = {
    hotel: [
      'Instant payment settlement (no waiting)',
      'Zero chargeback risk (immutable transactions)',
      'Lower transaction fees (vs. credit cards)',
      'Global reach (accept payments from anywhere)',
      'Transparent verification (on-chain proof)'
    ],
    hotelDownsides: [
      'Requires basic crypto knowledge',
      'Price volatility (can convert to stablecoins)',
      'Tax reporting complexity (consult accountant)'
    ],
    guest: [
      'Fast booking confirmation (instant)',
      'Transferable on marketplace (if plans change)',
      'Privacy-focused (no card details shared)',
      'No foreign transaction fees'
    ],
    guestDownsides: [
      'Non-refundable (but can list on marketplace)',
      'Requires crypto wallet setup',
      'Small gas fees for transactions (~$1-5)'
    ]
  };

  const propertyBenefits = {
    hotel: [
      'Familiar payment process (card/cash)',
      'No crypto wallet setup needed',
      'Standard accounting (traditional methods)'
    ],
    hotelDownsides: [
      'Must handle booking confirmations manually',
      'Guest no-show risk (no upfront payment)',
      'More spam/fake bookings possible'
    ],
    guest: [
      'No wallet needed (pay traditionally)',
      'Free cancellation anytime',
      'Familiar payment method (card/cash)'
    ],
    guestDownsides: [
      'Must call hotel to confirm within 48h',
      'Booking can auto-cancel if you forget',
      'No marketplace access (cannot transfer booking)'
    ]
  };

  if (variant === 'compact') {
    return (
      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        {/* Crypto */}
        <div className="space-y-2">
          <p className="font-semibold text-sm">💎 Crypto</p>
          <div className="space-y-1 text-muted-foreground">
            <p className="flex items-start gap-1"><CheckCircle2 className="h-3 w-3 mt-0.5 text-success flex-shrink-0" /> Instant confirmation</p>
            <p className="flex items-start gap-1"><CheckCircle2 className="h-3 w-3 mt-0.5 text-success flex-shrink-0" /> Transferable on marketplace</p>
            <p className="flex items-start gap-1"><XCircle className="h-3 w-3 mt-0.5 text-destructive flex-shrink-0" /> Non-refundable</p>
          </div>
        </div>
        {/* Property */}
        <div className="space-y-2">
          <p className="font-semibold text-sm">🏨 Pay at Property</p>
          <div className="space-y-1 text-muted-foreground">
            <p className="flex items-start gap-1"><CheckCircle2 className="h-3 w-3 mt-0.5 text-success flex-shrink-0" /> Free cancellation</p>
            <p className="flex items-start gap-1"><CheckCircle2 className="h-3 w-3 mt-0.5 text-success flex-shrink-0" /> No wallet needed</p>
            <p className="flex items-start gap-1"><XCircle className="h-3 w-3 mt-0.5 text-destructive flex-shrink-0" /> Must call to confirm</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Crypto Payments */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="text-lg font-heading font-semibold mb-1">💎 Crypto Payments</h4>
            <p className="text-xs text-muted-foreground">Bitcoin, Ethereum, Polygon, USDT, USDC + 4 more</p>
          </div>

          {/* Hotel Benefits */}
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">🏨</span>
              Hotel Benefits
            </p>
            <ul className="space-y-1.5">
              {cryptoBenefits.hotel.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hotel Downsides */}
          <div>
            <p className="text-sm font-semibold mb-2">Hotel Considerations</p>
            <ul className="space-y-1.5">
              {cryptoBenefits.hotelDownsides.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Info className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Guest Benefits */}
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-xs">👤</span>
              Guest Benefits
            </p>
            <ul className="space-y-1.5">
              {cryptoBenefits.guest.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Guest Downsides */}
          <div>
            <p className="text-sm font-semibold mb-2">Guest Considerations</p>
            <ul className="space-y-1.5">
              {cryptoBenefits.guestDownsides.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Info className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Pay at Property */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="text-lg font-heading font-semibold mb-1">🏨 Pay at Property</h4>
            <p className="text-xs text-muted-foreground">Card, cash, or bank transfer at check-in</p>
          </div>

          {/* Hotel Benefits */}
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">🏨</span>
              Hotel Benefits
            </p>
            <ul className="space-y-1.5">
              {propertyBenefits.hotel.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hotel Downsides */}
          <div>
            <p className="text-sm font-semibold mb-2">Hotel Considerations</p>
            <ul className="space-y-1.5">
              {propertyBenefits.hotelDownsides.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-destructive/60 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Guest Benefits */}
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-xs">👤</span>
              Guest Benefits
            </p>
            <ul className="space-y-1.5">
              {propertyBenefits.guest.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Guest Downsides */}
          <div>
            <p className="text-sm font-semibold mb-2">Guest Considerations</p>
            <ul className="space-y-1.5">
              {propertyBenefits.guestDownsides.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-destructive/60 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
