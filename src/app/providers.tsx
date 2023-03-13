'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'

// third-party providers that need to be rendered at the root,
// but also need to be client side rendered. app/layout.tsx
// CAN NOT be rendered client side
export function Providers({ children }: { children: React.ReactNode }) {
  // If you pass the session page prop to the <SessionProvider>
  // you can avoid checking the session twice on pages that support
  // both server and client side rendering.
  //
  // https://next-auth.js.org/getting-started/client#sessionprovider
  return <SessionProvider>{children}</SessionProvider>
}
