import React, { useState, useEffect } from 'react';
import { AdminShell } from '../../components/admin/AdminShell';
import { StatusPill } from '../../components/admin/StatusPill';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../components/ui/sheet';
import { CheckCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const AdminCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [amount, setAmount] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/commissions`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch commissions');

      const data = await response.json();
      setCommissions(data.commissions || []);
    } catch (error) {
      toast.error('Failed to load commissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async (hotelId) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/hotels/${hotelId}/commission`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ txHash, amount: parseFloat(amount), chain })
        }
      );

      if (!response.ok) throw new Error('Failed to mark as paid');

      toast.success('Commission marked as paid');
      setSelectedHotel(null);
      setTxHash('');
      setAmount('');
      fetchCommissions();
    } catch (error) {
      toast.error('Failed to mark commission as paid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalOwed = commissions.reduce((sum, c) => sum + (c.commission || 0), 0);
  const overdueCount = commissions.filter(c => c.isOverdue).length;

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight" data-testid="admin-commissions-title">
              Commission Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Track and verify commission payments from hotels
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Owed</p>
            <p className="text-2xl font-bold text-destructive tabular-nums" data-testid="total-commission-owed">
              ${totalOwed.toLocaleString()}
            </p>
            {overdueCount > 0 && (
              <Badge variant="destructive" className="mt-1">{overdueCount} overdue</Badge>
            )}
          </div>
        </div>

        {/* Commissions Table */}
        <Card className="rounded-xl border bg-card shadow-[var(--shadow-sm)] overflow-hidden" data-testid="commissions-table-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b">
                <TableRow>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Hotel</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Email</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Billing Status</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-right">Revenue</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-right">Commission</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Last Payment</TableHead>
                  <TableHead className="px-3 py-2 text-xs font-medium uppercase tracking-wide w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No commission data available
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions.map((commission) => (
                    <TableRow 
                      key={commission.hotelId} 
                      className="group hover:bg-muted/60"
                      data-testid={`commission-row-${commission.hotelId}`}
                    >
                      <TableCell className="px-3 py-2.5 text-sm font-medium">
                        {commission.hotelName}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm font-mono text-muted-foreground">
                        {commission.email}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm">
                        <StatusPill status={commission.billingStatus} testId={`status-${commission.hotelId}`} />
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm text-right font-mono">
                        ${commission.revenue?.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm text-right font-mono font-semibold">
                        <span className={commission.isOverdue ? 'text-destructive' : ''}>
                          ${commission.commission?.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-xs font-mono text-muted-foreground">
                        {commission.lastPaymentAt 
                          ? new Date(commission.lastPaymentAt).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm">
                        {!commission.isPaid && commission.commission > 0 && (
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedHotel(commission);
                                  setAmount(commission.commission.toString());
                                }}
                                data-testid={`verify-commission-${commission.hotelId}`}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Verify
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px]">
                              <SheetHeader>
                                <SheetTitle className="font-heading">Verify Commission Payment</SheetTitle>
                                <SheetDescription>
                                  Mark commission as paid for {selectedHotel?.hotelName}
                                </SheetDescription>
                              </SheetHeader>
                              <div className="mt-6 space-y-6">
                                {/* Commission Details */}
                                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Revenue</span>
                                    <span className="font-mono font-semibold">${selectedHotel?.revenue?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Commission (2%)</span>
                                    <span className="font-mono font-semibold text-lg">${selectedHotel?.commission?.toLocaleString()}</span>
                                  </div>
                                </div>

                                {/* Verification Form */}
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="amount">Amount Received (USD)</Label>
                                    <Input
                                      id="amount"
                                      type="number"
                                      step="0.01"
                                      value={amount}
                                      onChange={(e) => setAmount(e.target.value)}
                                      placeholder="150.00"
                                      data-testid="verify-amount-input"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="chain">Blockchain</Label>
                                    <Input
                                      id="chain"
                                      value={chain}
                                      onChange={(e) => setChain(e.target.value)}
                                      placeholder="ethereum"
                                      data-testid="verify-chain-input"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="txHash">Transaction Hash (Optional)</Label>
                                    <Input
                                      id="txHash"
                                      value={txHash}
                                      onChange={(e) => setTxHash(e.target.value)}
                                      placeholder="0x..."
                                      className="font-mono text-xs"
                                      data-testid="verify-txhash-input"
                                    />
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => handleMarkAsPaid(selectedHotel?.hotelId)}
                                    disabled={isSubmitting || !amount}
                                    className="flex-1"
                                    data-testid="confirm-payment-button"
                                  >
                                    {isSubmitting ? 'Processing...' : 'Confirm Payment'}
                                  </Button>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
};

export default AdminCommissions;
