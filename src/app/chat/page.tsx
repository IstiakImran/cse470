// app/(dashboard)/chat/page.tsx
export default function DefaultChatPage() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome to your messages
        </h2>
        <p className="mt-4 text-gray-600 max-w-md mx-auto">
          Select a conversation from the sidebar or search for users to start a
          new chat
        </p>
        <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100 inline-block">
          <p className="text-blue-800">
            You can send messages in real-time with other users on the platform
          </p>
        </div>
      </div>
    </div>
  );
}
