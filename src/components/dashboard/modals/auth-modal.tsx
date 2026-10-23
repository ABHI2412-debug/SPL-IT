"use client";

import React, { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { SplitLogo } from "../../ui/split-logo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; phone?: string | null } | null;
  supabase: SupabaseClient;
}

export function AuthModal({ isOpen, onClose, user, supabase }: AuthModalProps) {
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage("");
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
      });
      if (error) {
        setAuthMessage(error.message);
      } else {
        setOtpSent(true);
        setAuthMessage("One-time passcode sent to your phone via SMS.");
      }
    } catch {
      setAuthMessage("Network or service error. Check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage("");
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otpCode.trim(),
        type: "sms",
      });
      if (error) {
        setAuthMessage(error.message);
      } else {
        onClose();
        setOtpSent(false);
        setOtpCode("");
      }
    } catch {
      setAuthMessage("Failed to verify code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#12171c] border border-[#242f3a] rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="mb-2">
              <SplitLogo size="xs" variant="horizontal" />
            </div>
            <h3 className="text-lg font-bold text-[#e6edf3] mt-0.5">
              {user ? "Account Profile" : "Sign In to SPL/IT"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#182026] text-[#7d8b99] hover:text-[#e6edf3] flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#171f26] border border-[#232d36]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-serif font-bold flex items-center justify-center text-sm">
                  {user.phone ? user.phone.slice(-2) : "A"}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#e6edf3]">
                    {user.phone || "Active Account"}
                  </p>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Verified & Synced with Supabase
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#7d8b99] leading-relaxed">
              Your trips, shared splits, and personal transactions are safely encrypted and synced to your cloud ledger.
            </p>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              {isLoading ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Phone Number (with Country Code)
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={otpSent}
                className="w-full bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
              />
            </div>

            {otpSent && (
              <div>
                <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                  6-Digit SMS Verification Code
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] font-mono text-center tracking-widest outline-none"
                />
              </div>
            )}

            {authMessage && (
              <p className="text-xs text-amber-400/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                {authMessage}
              </p>
            )}

            <p className="text-[11px] text-[#6e7d8d] leading-relaxed">
              We send a secure one-time verification passcode. No password needed.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#09110d] font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              {isLoading
                ? "Processing..."
                : otpSent
                ? "Verify Code & Enter"
                : "Send Verification Code"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
