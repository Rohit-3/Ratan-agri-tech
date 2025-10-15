import React from 'react';

type Message = { role: 'user' | 'bot'; text: string };

const getSessionId = (): string => {
  try {
    const existing = localStorage.getItem('chat_session_id');
    if (existing) return existing;
    const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('chat_session_id', id);
    return id;
  } catch {
    return `sess_${Date.now()}`;
  }
};

const ChatWidget: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [typing, setTyping] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([{
    role: 'bot',
    text: 'Hi! I\'m your assistant. How can I help you today?'
  }]);

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setBusy(true);
    setTyping(true);
    try {
      const apiUrl = (import.meta as any)?.env?.VITE_API_URL || '';
      const sessionId = getSessionId();
      const lastPath = window.location.hash || '#/';
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId, last_path: lastPath })
      });
      const json = await res.json();
      const reply = json?.reply || '...';
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setBusy(false);
      setTyping(false);
    }
  };

  React.useEffect(() => {
    if (!open) return;
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {open && (
        <div className="w-80 h-96 bg-white/90 backdrop-blur border border-gray-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden">
          <div className="bg-accent text-gray-900 px-4 py-3 flex items-center justify-between">
            <div className="font-extrabold">Assistant</div>
            <button onClick={() => setOpen(false)} className="text-sm font-semibold hover:opacity-80">Close</button>
          </div>
          <div ref={containerRef} className="flex-1 p-3 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`mb-2 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl ${m.role === 'user' ? 'bg-accent text-gray-900' : 'bg-white border'} shadow` }>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="mb-2 flex justify-start">
                <div className="max-w-[60%] px-3 py-2 rounded-2xl bg-white border shadow text-gray-600">
                  <span className="inline-flex gap-1 align-middle">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.1s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="p-2 border-t bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button onClick={sendMessage} disabled={busy} className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black disabled:opacity-70">Send</button>
          </div>
        </div>
      )}
      {!open && (
        <button onClick={() => setOpen(true)} className="w-14 h-14 rounded-full shadow-2xl bg-accent text-gray-900 font-extrabold flex items-center justify-center hover:opacity-90 border border-gray-300">
          Chat
        </button>
      )}
    </div>
  );
};

export default ChatWidget;

