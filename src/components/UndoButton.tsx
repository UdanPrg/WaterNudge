import { Button } from "@/components/ui/Button";

interface UndoButtonProps {
  canUndo: boolean;
  onUndo: () => void;
}

export function UndoButton({ canUndo, onUndo }: UndoButtonProps) {
  return (
    <Button label="Deshacer último registro" variant="ghost" size="sm" disabled={!canUndo} onPress={onUndo} />
  );
}
