import { useState, useEffect, useRef } from "react";
import { botFlows } from "../items/botFlows.jsx";
import { MessageCircleMore, X } from "lucide-react";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: botFlows.start.message,
      options: botFlows.start.options,
    },
  ]);

  // Ref pour scroller automatiquement
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll automatique à chaque nouveau message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gérer clic sur bouton
  const handleOptionClick = (option) => {
    const next = botFlows[option.next];

    setMessages((prev) => [
      ...prev,
      { role: "user", content: option.label },
      { role: "bot", content: next.message, options: next.options },
    ]);
  };

  return (
    <>
      {/* Bulle Messenger flottante */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50
          bg-gradient-to-r from-blue-500 to-indigo-400
          text-white p-4 rounded-full shadow-xl
          hover:scale-105 transition-all duration-300"
      >
        {open ? <X /> : <MessageCircleMore />}
      </button>

      {/* Fenêtre Chat */}
      <div
        className={`fixed bottom-24 right-6 w-80 z-50 transition-all duration-300
          ${open ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none"}`}
      >
        {/* Conteneur principal */}
        <div className="bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden h-[480px]">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white p-4">
            <p className="font-semibold">Assistant Boutique</p>
            <p className="text-xs ml-2 opacity-80 text-green-700 font-bold">En ligne</p>
          </div>



          {/* Zone messages scrollable */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={msg.role === "user" ? "text-right" : ""}>
                  <span
                    className={`inline-block max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow
                      ${msg.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-sm"
                        : "bg-white text-gray-800 rounded-bl-sm"
                      }`}
                  >
                    {msg.content}
                  </span>
                </div>

                {/* Boutons cliquables */}
                {msg.options && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        className="border px-4 py-1 rounded-full text-sm hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 shadow-sm"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Ancre pour scroll automatique */}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 py-2 bg-white">
            Support client – Boutique
          </div>
        </div>
      </div>

      {/* Animation CSS */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.25s ease-out;
          }

          /* Scrollbar personnalisée */
          .flex-1::-webkit-scrollbar {
            width: 6px;
          }
          .flex-1::-webkit-scrollbar-thumb {
            background-color: rgba(59, 130, 246, 0.5);
            border-radius: 3px;
          }
          .flex-1::-webkit-scrollbar-track {
            background: rgba(229, 231, 235, 0.5);
          }
        `}
      </style>
    </>
  );
}
