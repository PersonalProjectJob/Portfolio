import { RouterProvider } from "react-router";
import { router } from "./routes";
import { I18nProvider } from "./lib/i18n";
import { ChatHistoryProvider } from "./lib/chatHistoryContext";
import { useSessionIdentity } from "./lib/sessionScope";

function SessionScopedRouter() {
  const { scopeKey } = useSessionIdentity();

  return (
    <ChatHistoryProvider key={scopeKey}>
      <RouterProvider router={router} />
    </ChatHistoryProvider>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <SessionScopedRouter />
    </I18nProvider>
  );
}
