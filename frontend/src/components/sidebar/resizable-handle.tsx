import { Separator as ResizeHandle } from "react-resizable-panels";
import { GripVertical } from "lucide-react";

export function ResizableHandle({
  className = "",
  id,
}: {
  className?: string;
  id?: string;
}) {
  return (
    <ResizeHandle
      className={`resize-handle ${className}`}
      id={id}
    >
      <div className="resize-grip">
        <GripVertical size={10} />
      </div>
    </ResizeHandle>
  );
}