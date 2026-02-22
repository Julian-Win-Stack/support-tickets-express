'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { NotificationsButton } from '@/app/components/NotificationBell';

const SessionStatus = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const showBackToTickets = pathname === '/notifications' || pathname === '/audit';

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
    <div className="bg-[#212A3E] rounded-lg py-2 px-3 sm:py-3 sm:px-6 border border-[#243353]">
      <h3 className="text-xs sm:text-sm font-medium">Session</h3>
      <p className="text-white text-xs sm:text-base truncate max-w-[120px] sm:max-w-none">
        {user ? `Logged in as ${user.name}` : 'Not logged in'}
      </p>
    </div>
    {user && (
      <div className="flex flex-wrap justify-end gap-1.5 sm:gap-2">
        {user.role === 'admin' && <NotificationsButton />}
        <div className="flex flex-col sm:flex-col gap-1.5 sm:gap-2 items-end">
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 rounded-[8px] border border-[#6b2b36] bg-[#3a1e25] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter] w-[100px] sm:w-[140px] text-center"
          >
            Logout
          </button>
          {showBackToTickets && (
            <Link
              href="/app"
              className="text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 rounded-[8px] border border-[#0e7490] bg-[#1c2a47] text-center w-[100px] sm:w-[140px] cursor-pointer hover:brightness-110 transition-[filter] no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12121C]"
            >
              <span className="text-[#e8eefc]">Back to tickets</span>
            </Link>
          )}
          <Link
            href="/audit"
            className="text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 rounded-[8px] border border-[#0e7490] bg-[#1c2a47] text-center w-[100px] sm:w-[140px] cursor-pointer hover:brightness-110 transition-[filter] no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12121C]"
          >
            <span className="text-[#e8eefc]">Audit Logs</span>
          </Link>
        </div>
        </div>
      )}
    </div>
  );
};

export default SessionStatus;