'use client';
import { useAuth } from '@/contexts/AuthContext'

const SessionStatus = () => {
  const { user } = useAuth();
  return (
    <div className="bg-[#212A3E] rounded-lg py-3 px-6 border border-[#243353]">
        <h3 className="text-sm font-medium">Session</h3>
        <p className="text-white">{user ? `Logged in as ${user.name}` : 'Not logged in'}</p>
    </div>
  )
}

export default SessionStatus