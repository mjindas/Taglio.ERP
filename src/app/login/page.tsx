"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { Lock, User as UserIcon, Building } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { users, companyInfo, login } = useStore();
  const [companyCode, setCompanyCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // Mock password
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyCode || !username || !password) {
      setError("Please fill all fields");
      return;
    }
    
    // Company code check
    if (companyCode.toUpperCase() !== companyInfo.code.toUpperCase()) {
      setError("Invalid company credentials");
      return;
    }

    // Check user credentials
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) {
      setError("Invalid username or password");
      return;
    }

    login(companyInfo, user);
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 absolute inset-0 z-50">
      <div className="max-w-md w-full mx-auto space-y-8 glass-card p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 bg-white">
        <div>
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            T
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Taglio
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ERP Authentication
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg">{error}</p>}
          <div className="space-y-4">
            <div className="relative">
              <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder-gray-400"
                placeholder="Company Code (Hint: TAGLIO)"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
              />
            </div>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder-gray-400"
                placeholder="Username (Hint: admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder-gray-400"
                placeholder="Password (Hint: test123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg shadow-indigo-500/30"
            >
              Sign in securely
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
