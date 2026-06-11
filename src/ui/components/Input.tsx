import figureSet from "figures";
import { Box, Text, useInput } from "ink";
import { useState } from "react";

interface InputProps {
  onSubmit: (value: string) => void;
  disabled: boolean;
}
export function Input({ onSubmit, disabled }: InputProps) {
  const [value, setValue] = useState("");

  useInput((input, key) => {
    if (disabled) return;
    if (key.return) {
      if (value.trim()) {
        onSubmit(value);
        setValue("");
      }

      return;
    }
    if (key.backspace || key.delete) {
      setValue((prev) => prev.slice(0, -1));
    }

    if (input && !key.ctrl && !key.meta) {
      setValue((prev) => prev + input);
    }
  });

  return (
    <Box>
      <Text color={disabled ? "gray" : "cyan"} bold>
        {`${figureSet.triangleRight} `}
      </Text>
      {disabled ? (
        <Text dimColor>thinking…</Text>
      ) : (
        <Text>
          {value}
          <Text color="cyan">▋</Text>
        </Text>
      )}
    </Box>
  );
}
