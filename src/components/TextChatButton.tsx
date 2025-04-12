import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatModal from './ChatModal';

interface TextChatButtonProps {
  className?: string;
  context?: string;
}

const TextChatButton: React.FC<TextChatButtonProps> = ({ className = '', context }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl ${className}`}
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        <span>Chat with NutriDecode</span>
      </button>

      <ChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        context={context}
      />
    </>
  );
};

export default TextChatButton; 