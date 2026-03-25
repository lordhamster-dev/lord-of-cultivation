import Decimal from 'break_eternity.js';

interface NumberDisplayProps {
  value: string | number;
  suffix?: string;
  className?: string;
}

/** Formats large Decimal numbers for display. */
export function NumberDisplay({ value, suffix = '', className = '' }: NumberDisplayProps) {
  const formatted = formatNumber(new Decimal(value));
  return (
    <span className={className}>
      {formatted}
      {suffix}
    </span>
  );
}

/** Format a Decimal to a human-readable string. */
function formatNumber(d: Decimal): string {
  if (d.gte('1e15')) {
    return d.toExponential(2);
  }
  if (d.gte(1_000_000_000)) {
    return d.div(1_000_000_000).toFixed(2) + 'B';
  }
  if (d.gte(1_000_000)) {
    return d.div(1_000_000).toFixed(2) + 'M';
  }
  if (d.gte(1_000)) {
    return d.div(1_000).toFixed(2) + 'K';
  }
  if (d.gte(1)) {
    return d.toFixed(1);
  }
  return d.toFixed(3);
}
