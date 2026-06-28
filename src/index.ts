#!/usr/bin/env node

import { render } from "ink";
import { createElement } from "react";
import { App } from "./ui/App.js";
import { OPENAI_API_KEY } from "./config.js";

if (!OPENAI_API_KEY) {
  console.error(
    "Missing OPENAI_API_KEY. Set it in your environment or in a .env file.\n" +
      "See .env.example for details.",
  );
  process.exit(1);
}

render(createElement(App));
