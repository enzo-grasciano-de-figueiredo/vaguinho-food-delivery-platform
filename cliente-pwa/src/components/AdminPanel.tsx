import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Calendar, Clock, LockOpen, X, Database } from 'lucide-react';
import { supabase } from '../utils/supabase';

export const AdminPanel: React.FC = () => {
  const { isAuthenticated, adminConfig, setAdminConfig } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) return null;

  // Dias da semana para simulação
  const days = [
    { label: 'Domingo', value: 0 },
    { label: 'Segunda', value: 1 },
    { label: 'Terça', value: 2 },
    { label: 'Quarta', value: 3 },
    { label: 'Quinta', value: 4 },
    { label: 'Sexta', value: 5 },
    { label: 'Sábado', value: 6 }
  ];

  const handleSimulateDay = (dayIndex: number) => {
    const d = new Date();
    const diff = dayIndex - d.getDay();
    d.setDate(d.getDate() + diff);
    // Preserva a hora se já estiver simulada
    if (adminConfig.simulatedTime) {
      d.setHours(adminConfig.simulatedTime.getHours(), adminConfig.simulatedTime.getMinutes());
    }
    setAdminConfig({ ...adminConfig, simulatedTime: d });
  };

  const handleSimulateTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    const d = adminConfig.simulatedTime ? new Date(adminConfig.simulatedTime) : new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10), 0);
    setAdminConfig({ ...adminConfig, simulatedTime: d });
  };

  const handleReset = () => {
    setAdminConfig({ simulatedTime: null, ignoreStoreStatus: false, ignoreDeliveryRule: false });
  };

  const forceAllProductsStatus = async (status: boolean) => {
    try {
      const { error } = await supabase
        .from('Produtos')
        .update({ disponibilidade: status })
        .not('id', 'is', null); // Atualiza todos
      
      if (error) throw error;
      alert(`Todos os produtos foram marcados como ${status ? 'DISPONÍVEIS' : 'ESGOTADOS'} com sucesso no Banco de Dados!`);
    } catch (e) {
      console.error(e);
      alert('Erro ao forçar estoque.');
    }
  };

  const simulatedTimeStr = adminConfig.simulatedTime 
    ? `${adminConfig.simulatedTime.getHours().toString().padStart(2, '0')}:${adminConfig.simulatedTime.getMinutes().toString().padStart(2, '0')}`
    : '';

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-[90] bg-emerald-600 text-white p-2 rounded-full shadow-lg hover:bg-emerald-500 transition-colors"
        title="Abrir Painel Admin"
      >
        <ShieldCheck size={24} />
      </button>

      {/* Modal / Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#27272a]">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck size={20} />
                <h3>Simulador (Modo Dev)</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Dia da Semana */}
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  <Calendar size={14} /> Forçar Dia da Semana
                </label>
                <select
                  value={adminConfig.simulatedTime ? adminConfig.simulatedTime.getDay() : new Date().getDay()}
                  onChange={(e) => handleSimulateDay(parseInt(e.target.value))}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded p-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {days.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Horário */}
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  <Clock size={14} /> Forçar Horário
                </label>
                <input
                  type="time"
                  value={simulatedTimeStr || `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`}
                  onChange={(e) => handleSimulateTime(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded p-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Travas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-[#09090b] p-3 rounded border border-[#27272a]">
                  <div className="flex items-center gap-2">
                    <LockOpen size={16} className={adminConfig.ignoreStoreStatus ? 'text-red-400' : 'text-gray-400'} />
                    <span className="text-sm text-gray-300">Ignorar Loja Fechada</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={adminConfig.ignoreStoreStatus}
                      onChange={(e) => setAdminConfig({...adminConfig, ignoreStoreStatus: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between bg-[#09090b] p-3 rounded border border-[#27272a]">
                  <div className="flex items-center gap-2">
                    <LockOpen size={16} className={adminConfig.ignoreDeliveryRule ? 'text-red-400' : 'text-gray-400'} />
                    <span className="text-sm text-gray-300">Ignorar Regra Delivery</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={adminConfig.ignoreDeliveryRule}
                      onChange={(e) => setAdminConfig({...adminConfig, ignoreDeliveryRule: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
              </div>

              {/* Botões de Força Bruta (Banco de Dados) */}
              <div className="space-y-2 border-t border-[#27272a] pt-4">
                <label className="flex items-center gap-2 text-xs text-amber-500 mb-2 uppercase tracking-wider font-bold">
                  <Database size={14} /> Forçar Banco de Dados (Teste)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => forceAllProductsStatus(true)}
                    className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-600/50 py-2 rounded text-xs font-bold transition-colors"
                  >
                    Ativar Todos (Perfeito)
                  </button>
                  <button
                    onClick={() => forceAllProductsStatus(false)}
                    className="bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-600/50 py-2 rounded text-xs font-bold transition-colors"
                  >
                    Esgotar Todos
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#27272a] flex gap-2">
              <button 
                onClick={handleReset}
                className="flex-1 bg-transparent border border-gray-600 text-gray-400 hover:text-white hover:bg-[#27272a] py-2 rounded font-bold text-xs"
              >
                Resetar ao Real
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded font-bold text-xs shadow-lg shadow-emerald-600/30"
              >
                Aplicar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
