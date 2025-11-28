"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function MessagesSection({ bookingId }: { bookingId: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [messageContent, setMessageContent] = useState("");

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", bookingId],
    queryFn: () => apiClient.getMessagesByBooking(bookingId),
    enabled: !!bookingId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      apiClient.createMessage(
        bookingId,
        session?.user?.id || "",
        content
      ),
    onSuccess: () => {
      setMessageContent("");
      queryClient.invalidateQueries({ queryKey: ["messages", bookingId] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageContent.trim()) {
      sendMessageMutation.mutate(messageContent);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Messages</h2>

      {messagesLoading ? (
        <div className="space-y-4 mb-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-3/4" />
          ))}
        </div>
      ) : messages && messages.length > 0 ? (
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded ${
                message.userId === session?.user?.id
                  ? "bg-blue-100 ml-auto w-3/4"
                  : "bg-slate-100 mr-auto w-3/4"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-600 mb-6">No messages yet.</p>
      )}

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={sendMessageMutation.isPending || !messageContent.trim()}
        >
          Send
        </Button>
      </form>
    </Card>
  );
}

