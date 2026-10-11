'use client';
import { useState } from 'react';
import { Logo, Card, Button } from '@karpos/ui';

export default function KioscoLoginPage() {
  const [pin, setPin] = useState('');
  
  const handlePin = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleClear = () => setPin('');
  
  const handleLogin = () => {
    // LLamar al nuevo endpoint /api/auth/login-pin
    console.log('Ingresando con PIN:', pin);
    window.location.href = '/console/mis-tareas';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-4">
      <Card className="w-full max-w-sm p-8 bg-neutral-800 border-neutral-700 text-white flex flex-col items-center">
        <Logo className="text-white [&_span]:text-brand-400 mb-8 w-32" />
        
        <h2 className="text-xl font-medium mb-6 text-center">Ingreso de Operario</h2>
        
        {/* User Selection mock */}
        <div className="w-full p-4 mb-6 rounded-xl bg-neutral-700 flex items-center gap-4 cursor-pointer hover:bg-neutral-600 transition">
          <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-lg font-bold">
            JP
          </div>
          <div>
            <div className="font-medium">Juan Pérez</div>
            <div className="text-sm text-neutral-400">Operario de Tractor</div>
          </div>
        </div>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full ${pin.length > i ? 'bg-brand-500' : 'bg-neutral-600'}`} />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handlePin(num.toString())}
              className="p-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-2xl font-semibold transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="p-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 font-semibold text-neutral-400 transition"
          >
            DEL
          </button>
          <button
            onClick={() => handlePin('0')}
            className="p-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 text-2xl font-semibold transition"
          >
            0
          </button>
          <button
            onClick={handleLogin}
            disabled={pin.length < 4}
            className="p-4 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 disabled:opacity-50 disabled:bg-neutral-700 text-white font-bold transition"
          >
            GO
          </button>
        </div>
      </Card>
    </div>
  );
}
