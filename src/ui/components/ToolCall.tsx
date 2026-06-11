import { Box, Text } from "ink";
import InkSpinner from "ink-spinner";
import figureSet from "figures";

export interface ToolCallProps {
  name: string;
  args?: Record<string, any>;
  status: "pending" | "completed";
  result?: string | undefined;
}

function truncate(text: string, max = 60) {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > max ? `${oneLine.slice(0, max)}…` : oneLine;
}

export function ToolCall({ name, status, args }: ToolCallProps) {
  return (
    <Box gap={1}>
      {status === "pending" ? (
        <Text color="yellow">
          <InkSpinner />
        </Text>
      ) : (
        <Text color="green">{figureSet.tick}</Text>
      )}
      <Text bold>{name}</Text>
      {args && Object.keys(args).length > 0 && (
        <Text dimColor>{truncate(JSON.stringify(args))}</Text>
      )}
    </Box>
  );
}
