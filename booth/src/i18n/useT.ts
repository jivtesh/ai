import { useBooth } from "../state/store";
import { translate, type StringId } from "./strings";

export function useT() {
  const lang = useBooth((s) => s.lang);
  return (id: StringId) => translate(id, lang);
}
