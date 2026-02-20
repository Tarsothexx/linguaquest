import React, { useState } from 'react';
import { runAllMigrations } from './migrate';

export const AdminPanel = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const executeMigration = async () => {
    setIsMigrating(true);
    setMessages(['Iniciando migração...']);

    try {
      const result = await runAllMigrations();
      if (result.success) {
        setMessages(prev => [...prev, '✅ Migração concluída com sucesso!']);
      } else {
        setMessages(prev => [...prev, `❌ Erro: ${result.message}`]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, `❌ Erro: ${error.message}`]);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-lg mb-2">⚙️ Admin Panel</h3>
      
      <button
        onClick={executeMigration}
        disabled={isMigrating}
        className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
          isMigrating
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isMigrating ? '⏳ Migrando...' : '🚀 Migrar Dados para Firebase'}
      </button>

      {messages.length > 0 && (
        <div className="mt-3 bg-gray-50 p-2 rounded-lg max-h-48 overflow-y-auto">
          {messages.map((msg, idx) => (
            <p key={idx} className="text-sm text-gray-700 mb-1 font-mono">
              {msg}
            </p>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        ⚠️ Execute APENAS uma vez! Depois remova este botão.
      </p>
    </div>
  );
};