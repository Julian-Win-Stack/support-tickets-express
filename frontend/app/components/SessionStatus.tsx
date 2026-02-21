'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const SessionStatus = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="flex flex-col gap-2">
    <div className="bg-[#212A3E] rounded-lg py-3 px-6 border border-[#243353]">
      <h3 className="text-sm font-medium">Session</h3>
      <p className="text-white">{user ? `Logged in as ${user.name}` : 'Not logged in'}</p>
    </div>
    {user && (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 text-sm py-2 px-3 rounded-[8px] border border-[#6b2b36] bg-[#3a1e25] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter] w-fit"
        >
          Logout
        </button>
        </div>
      )}
    </div>
  );
};

export default SessionStatus;