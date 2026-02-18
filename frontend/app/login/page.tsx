"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [name, setName] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState<string | null>(null);
  const [registerEmail, setRegisterEmail] = useState<string | null>(null);
  const [loginPassword, setLoginPassword] = useState<string | null>(null);
  const [registerPassword, setRegisterPassword] = useState<string | null>(null);
  const { logout, login, register, error, user, successMessage } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/app');
    }
  }, [user]);

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    register(name ?? '', registerEmail ?? '', registerPassword ?? '');
    setName('');
    setRegisterEmail('');
    setRegisterPassword('');
  }

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    login(loginEmail ?? '', loginPassword ?? '');
    setLoginEmail('');
    setLoginPassword('');
  }

  function handleLogout() {
    logout();
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="w-full max-w-[720px] mx-auto mt-6 md:mt-12 grid gap-4">
        {/* Register card - matches .card + #auth-card */}
        <div className="bg-[#121a2a] border border-[#1e2a44] rounded-[12px] p-4">
          <form className="grid gap-2.5 mt-2.5"
          onSubmit={handleRegister}
          >
            <h2 className="m-0 text-base font-medium text-[#e8eefc] mb-3">
              Register
            </h2>
            <div className="grid gap-1.5">
              <label
                htmlFor="register-name"
                className="text-xs text-[#aab6d6]"
              >
                Name
              </label>
              <input
                type="text"
                id="register-name"
                name="name"
                placeholder="Your name"
                value={name ?? ''}
                required
                className="w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor="register-email"
                className="text-xs text-[#aab6d6]"
              >
                Email
              </label>
              <input
                type="email"
                id="register-email"
                name="email"
                placeholder="you@example.com"
                value={registerEmail ?? ''}
                required
                className="w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]"
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor="register-password"
                className="text-xs text-[#aab6d6]"
              >
                Password
              </label>
              <input
                type="password"
                id="register-password"
                name="password"
                placeholder="••••••••"
                value={registerPassword ?? ''}
                required
                className="w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]"
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-3 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer w-full mt-1 hover:brightness-110 transition-[filter]"
            >
              Register
            </button>
          </form>
        </div>

        {/* Login card - matches .card */}
        <div className="bg-[#121a2a] border border-[#1e2a44] rounded-[12px] p-4">
          <form className="grid gap-2.5 mt-2.5"
          onSubmit={handleLogin}>
            <h2 className="m-0 text-base font-medium text-[#e8eefc] mb-3">
              Login
            </h2>
            <div className="grid gap-1.5">
              <label htmlFor="login-email" className="text-xs text-[#aab6d6]">
                Email
              </label>
              <input
                type="email"
                id="login-email"
                name="email"
                placeholder="you@example.com"
                value={loginEmail ?? ''}
                autoComplete="current-email"
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]"
              />
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor="login-password"
                className="text-xs text-[#aab6d6]"
              >
                Password
              </label>
              <input
                type="password"
                id="login-password"
                name="password"
                placeholder="••••••••"
                value={loginPassword ?? ''}
                autoComplete="current-password"
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-3 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer w-full mt-1 hover:brightness-110 transition-[filter]"
            >
              Login
            </button>
            {user && 
            <div className="mt-1 flex justify-start">
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm py-2 px-3 rounded-[8px] border border-[#6b2b36] bg-[#3a1e25] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter]"
              >
                Logout
              </button>
            </div>}
          </form>
          <p className="text-sm text-yellow-500 mt-4 mb-2">{error}</p>
          <p className="text-sm text-yellow-500 mt-4 mb-2">{successMessage}</p>
        </div>
      </div>
    </main>
  );
}
