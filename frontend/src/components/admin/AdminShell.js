import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  AlertTriangle,
  Activity,
  Menu,
  LogOut,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, testId: 'admin-nav-dashboard' },
  { name: 'Hotels', href: '/admin/hotels', icon: Building2, testId: 'admin-nav-hotels' },
  { name: 'Commissions', href: '/admin/commissions', icon: DollarSign, testId: 'admin-nav-commissions' },
  { name: 'Billing Alerts', href: '/admin/billing', icon: AlertTriangle, testId: 'admin-nav-billing' },
  { name: 'Activity', href: '/admin/activity', icon: Activity, testId: 'admin-nav-activity' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, testId: 'admin-nav-settings' }
];

export const AdminShell = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-[hsl(var(--admin-sidebar-border))] px-4">
        <Link to="/admin/dashboard" className="flex items-center space-x-2" data-testid="admin-logo-link">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-heading font-bold text-lg">B</span>
          </div>
          <span className="font-heading font-bold text-lg">Bitsy Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                data-testid={item.testId}
                className={
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-[hsl(var(--admin-sidebar-foreground))] hover:bg-[hsl(var(--admin-sidebar-muted))] hover:text-[hsl(var(--admin-sidebar-foreground))]'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-[hsl(var(--admin-sidebar-border))]" />

      {/* User info & logout */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-[hsl(var(--admin-sidebar-foreground))] hover:bg-[hsl(var(--admin-sidebar-muted))]"
          onClick={handleLogout}
          data-testid="admin-logout-button"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div data-theme="admin" className="min-h-screen bg-background text-foreground">
      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col bg-[hsl(var(--admin-sidebar))] text-[hsl(var(--admin-sidebar-foreground))] border-r border-[hsl(var(--admin-sidebar-border))] h-screen sticky top-0">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <div className="flex flex-col">
          {/* Mobile Header */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 px-4 lg:px-6">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" data-testid="admin-mobile-menu-button">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-[hsl(var(--admin-sidebar))] text-[hsl(var(--admin-sidebar-foreground))] border-[hsl(var(--admin-sidebar-border))]">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="flex-1" />

            {/* Admin indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 bg-success rounded-full" />
              <span>Admin Console</span>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
