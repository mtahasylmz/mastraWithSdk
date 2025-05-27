"use client";
import ChatInterface from "@/components/chat/ChatInterface";
import ErrorBoundary from "@/components/ErrorBoundary";

const Page = () => {
  return (
    <ErrorBoundary>
      <div className="h-screen bg-gray-50">
        <ChatInterface />
      </div>
    </ErrorBoundary>
  );
};

export default Page;