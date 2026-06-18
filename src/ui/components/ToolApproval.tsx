import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import type { toolApprovalRequest } from "../../agent/type.js";

export function ToolApproval({
  toolName,
  args,
  onResolve,
}: {
  toolName: string;
  args: {};
  onResolve: (approve: boolean) => void;
}) {
  const items = [
    {
      label: "✅ Approve",
      value: true,
    },
    {
      label: "❌ Reject",
      value: false,
    },
  ];

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold>Tool Approval Required</Text>

      <Text>The agent wants to execute the following command:</Text>

      <Text color="cyan">{JSON.stringify(args)}</Text>

      <Box marginTop={1}>
        <SelectInput
          items={items}
          onSelect={(item) => {
            onResolve(item.value);
          }}
        />
      </Box>
    </Box>
  );
}
