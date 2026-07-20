import { useAppState } from "@/context/AppStateProvider";

export function useHistory() {
  const { history } = useAppState();
  return { history };
}
