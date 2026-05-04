'use client';

import { useState } from 'react';
import { Button, Card, CardContent, Input, PageHeader } from '@karpos/ui';

export default function IqPage() {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);

  async function ask() {
    if (!question.trim()) return;
    const q = question;
    setHistory((h) => [...h, { role: 'user', text: q }]);
    setQuestion('');
    try {
      const res = await fetch('/api/copilot/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setHistory((h) => [...h, { role: 'assistant', text: data?.message?.content ?? 'Sin respuesta.' }]);
    } catch {
      setHistory((h) => [...h, { role: 'assistant', text: 'No fue posible contactar al copiloto.' }]);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Karpos IQ"
        description="Copiloto agronómico. Cita las fuentes técnicas y los datos del lote."
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="min-h-[240px] space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-karpos-bark/60">
                Pregúntale, por ejemplo: <em>“¿qué umbral de mildiu aplico esta semana en mi lote de uva?”</em>
              </p>
            ) : (
              history.map((m, i) => (
                <div
                  key={i}
                  className={`whitespace-pre-wrap rounded-md p-3 text-sm ${
                    m.role === 'user'
                      ? 'bg-karpos-fog text-karpos-bark'
                      : 'bg-karpos-leaf/5 border border-karpos-leaf/15 text-karpos-bark'
                  }`}
                >
                  <strong>{m.role === 'user' ? 'Tú: ' : 'Karpos IQ: '}</strong>
                  {m.text}
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask()}
              placeholder="Pregúntale al copiloto…"
            />
            <Button onClick={ask}>Enviar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
