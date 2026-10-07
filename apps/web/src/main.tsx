import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const root = document.getElementById("root");
if (root === null) throw new Error("Missing application root");

createRoot(root).render(
  <StrictMode>
    <Theme theme={neutralTheme}>
      <main>
        <Heading level={1}>TruthBase</Heading>
        <Text>Local development scaffold</Text>
      </main>
    </Theme>
  </StrictMode>,
);
