import { Box, Text, useApp } from "ink";
import { MessageList, type Message } from "./components/MessageList.js";
import { useCallback, useState } from "react";
import { ToolCall, type ToolCallProps } from "./components/ToolCall.js";
import { Input } from "./components/Input.js";
import { runAgent } from "../agent/run.js";
import type { ModelMessage } from "ai";

interface ActiveToolCall extends ToolCallProps {
  id: string;
}

export function App() {
  const { exit } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [stremingText, setStreamingText] = useState("");
  const [activeToolCalls, setActiveToolCalls] = useState<ActiveToolCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    ModelMessage[]
  >([]);

  const handleSubmit = useCallback(
    async (userInput: string) => {
      if (
        userInput.toLowerCase() === "exit" ||
        userInput.toLowerCase() === "quit"
      ) {
        exit();
        return;
      }

      setMessages((prev) => [...prev, { role: "user", content: userInput }]);
      setLoading(true);

      try {
        const newHistory = await runAgent(userInput, conversationHistory, {
          onToken: (token) => {
            setStreamingText((prev) => prev + token);
          },
          onToolCallStart: (name, id, input) => {
            setActiveToolCalls((prev) => [
              ...prev,
              {
                id,
                name,
                args: input,
                status: "pending",
              },
            ]);
          },
          onToolCallEnd: (name, result) => {
            setActiveToolCalls((prev) =>
              prev.map((tc) =>
                tc.name === name && tc.status === "pending"
                  ? { ...tc, status: "completed", result }
                  : tc,
              ),
            );
          },
          onComplete: (fullResponse) => {
            setStreamingText("");
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: fullResponse },
            ]);
            setActiveToolCalls([]);
          },
        });
        setConversationHistory(newHistory);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${error instanceof Error ? error.message : "Unknown Error"}`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [conversationHistory, exit],
  );

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box marginBottom={1} gap={1}>
        <Text color="cyan" bold>
          AI Agent
        </Text>
        <Text dimColor>type "exit" to quit</Text>
      </Box>
      <Box flexDirection="column">
        <MessageList messages={messages} />
        {activeToolCalls.length > 0 && (
          <Box flexDirection="column" marginBottom={1}>
            {activeToolCalls.map((tc) => (
              <ToolCall
                key={tc.id}
                name={tc.name}
                args={tc.args ?? {}}
                status={tc.status}
                result={tc.result}
              />
            ))}
          </Box>
        )}
        {stremingText && (
          <Box marginBottom={1}>
            <Text>{stremingText}</Text>
          </Box>
        )}
      </Box>
      <Input onSubmit={handleSubmit} disabled={loading} />
    </Box>
  );
}
