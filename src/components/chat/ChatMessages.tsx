"use client";

export function ChatMessages() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-muted-foreground">
          Start a new conversation
        </h2>
        <p className="text-muted-foreground">
          Select an assistant or ask a general question to begin.
        </p>
      </div>
    </div>
  );
}