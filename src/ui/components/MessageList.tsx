import figureSet from "figures";
import { Box, Text } from "ink";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <Box flexDirection="column">
      {messages.map((msg, i) => (
        <Box key={`${msg.role}-${i}`} marginBottom={1}>
          {msg.role === "user" ? (
            <Text color="cyan" bold>
              {`${figureSet.triangleRight} `}
              <Text color="white" bold={false}>
                {msg.content}
              </Text>
            </Text>
          ) : (
            <Text>{msg.content}</Text>
          )}
        </Box>
      ))}
    </Box>
  );
}
