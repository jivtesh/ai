// Split a headline into n visually balanced lines at word boundaries,
// so translated copy flows through the same mask-reveal choreography.

export function balanceLines(text: string, lines: number): string[] {
  if (lines <= 1) return [text];
  const words = text.split(" ");
  if (lines === 2) {
    let best = 1;
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
      const left = words.slice(0, i).join(" ").length;
      const right = words.slice(i).join(" ").length;
      const diff = Math.abs(left - right);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    }
    return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  }
  const target = Math.ceil(text.length / lines);
  const out: string[] = [];
  let current = "";
  for (const word of words) {
    if (current && current.length + 1 + word.length > target && out.length < lines - 1) {
      out.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) out.push(current);
  return out;
}
