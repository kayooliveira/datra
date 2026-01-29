import { Separator as ResizeHandle } from "react-resizable-panels";
import { GripVertical } from "lucide-react";
import styles from "./resizable-handle.module.css";

export function ResizableHandle({
  className = "",
  id,
}: {
  className?: string;
  id?: string;
}) {
  return (
    <ResizeHandle
      className={`${styles.handle} ${className}`}
      id={id}
    >
      <div className={styles.grip}>
        <GripVertical size={10} />
      </div>
    </ResizeHandle>
  );
}
