"use client";

import { Amplify } from "aws-amplify";
import { useEffect } from "react";

export function ConfigureAmplify() {
  useEffect(() => {
    // Configure Amplify on client side only
    try {
      const outputs = require("@/amplify_outputs.json");
      if (outputs.version) {
        Amplify.configure(outputs, { ssr: true });
      }
    } catch (e) {
      // amplify_outputs.json not found - backend not yet deployed
      console.warn(
        "Amplify backend not configured. Run 'npm run amplify:sandbox' to set up the backend."
      );
    }
  }, []);

  return null;
}
