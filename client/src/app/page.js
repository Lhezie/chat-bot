
import Router from 'next/router.js';
import ChatBot from '../components/chatBot.jsx';
import "./globals.css";


export default function Home() {
  
  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
        <ChatBot />
      </div>
    </main>
  );
}
