import React, { useEffect } from "react";
import { useStatusBar } from "../../contexts/status-bar-context";
import { useSessionStore } from "../../stores/sessionStore";
import { Database } from "lucide-react";
import { connection } from "../../../wailsjs/go/models";

interface EditorStatusBarProps {
  sessionInfo: connection.SessionSummary | null;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  sessionInfo,
}) => {
  const { addItem, removeItem } = useStatusBar();
  const { sessionContexts } = useSessionStore();
  
  const activeContext = sessionInfo?.id ? sessionContexts[sessionInfo.id] : null;

  useEffect(() => {
    const parts = [];
    if (sessionInfo?.profile_name) parts.push(sessionInfo.profile_name);
    if (activeContext?.schema) parts.push(activeContext.schema);
    else parts.push("No schema");

    const label = parts.join(" - ");

    addItem({
      id: "editor-connection",
      section: "left",
      priority: 500,
      content: (
        <div
          className="flex items-center gap-2 px-2 text-xs text-gray-300"
          title="Active Connection"
        >
          <Database size={12} className="text-blue-400 mr-4" />
          <span className="font-semibold">{label}</span>
        </div>
      ),
    });

    return () => removeItem("editor-connection");
  }, [addItem, removeItem, sessionInfo, activeContext]);

  return null;
};
