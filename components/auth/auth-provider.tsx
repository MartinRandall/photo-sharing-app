"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}
