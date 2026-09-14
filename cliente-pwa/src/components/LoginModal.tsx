import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, ShieldAlert, KeyRound, Flame, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(pin);
    if (!success) {
      setError(true);
      setPin('');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <X size={20} />
        </button>
        {/* Top Gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ea580c] via-red-500 to-amber-500" />

        <div className="text-center mb-6 pt-2">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[#ea580c] to-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.4)]">
            <Flame className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-wider text-white">
            Assados <span className="text-[#ea580c]">Vaguinho</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
            <Lock size={14} className="text-[#ea580c]" /> Ambiente de Homologação Dev
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              PIN de Acesso Dev
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Digite o PIN (ex: 123456)"
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 text-center text-lg tracking-widest font-mono focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all"
                autoFocus
              />
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs font-medium"
            >
              <ShieldAlert size={16} className="shrink-0" />
              <span>PIN incorreto. Tente novamente (Dica: 123456).</span>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#ea580c] to-red-600 hover:from-[#f97316] hover:to-red-500 text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-[0_4px_20px_rgba(234,88,12,0.3)] transition-all active:scale-[0.98]"
          >
            Acessar Sistema
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#27272a]/60 text-center">
          <p className="text-[11px] text-gray-500">
            Ambiente hospedado via Cloudflare Tunnel em <br />
            <span className="text-gray-400 font-mono">assados-vaguinho.grasciano.com.br</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
