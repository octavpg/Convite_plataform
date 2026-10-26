const SIZE = 11;

// QR decorativo (no es un código real): esquinas tipo "finder" y relleno determinista.
function isOn(row: number, col: number): boolean {
  const inCorner =
    (row < 3 && col < 3) || (row < 3 && col >= SIZE - 3) || (row >= SIZE - 3 && col < 3);
  if (inCorner) {
    const isCenter =
      (row === 1 && col === 1) ||
      (row === 1 && col === SIZE - 2) ||
      (row === SIZE - 2 && col === 1);
    return !isCenter;
  }
  return (row * 7 + col * 13 + row * col) % 3 === 0;
}

const CELLS = Array.from({ length: SIZE * SIZE }, (_, i) =>
  isOn(Math.floor(i / SIZE), i % SIZE),
);

export function TicketPreview() {
  return (
    <div
      aria-hidden
      className="relative w-72 -rotate-2 rounded-2xl bg-[#F7F5FA] text-[#1F1B33] shadow-2xl"
    >
      <div className="space-y-1 p-6">
        <p className="text-sm text-[#1F1B33]/60">Boda de Ana y Luis</p>
        <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Familia Pérez
        </p>
        <p className="text-sm">Sábado 14 de noviembre, Mérida</p>
      </div>

      <div className="relative border-t-2 border-dashed border-[#1F1B33]/20">
        <span className="absolute -left-3 -top-3 size-6 rounded-full bg-[#1F1B33]" />
        <span className="absolute -right-3 -top-3 size-6 rounded-full bg-[#1F1B33]" />
        <div className="flex items-center justify-between gap-4 p-6">
          <div className="grid w-24 grid-cols-11 gap-px">
            {CELLS.map((on, i) => (
              <span
                key={i}
                className={on ? "aspect-square bg-[#1F1B33]" : "aspect-square"}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-14 items-center justify-center rounded-full bg-[#F4B63F] font-[family-name:var(--font-display)] text-3xl font-semibold">
              4
            </span>
            <span className="text-sm">pases</span>
          </div>
        </div>
      </div>
    </div>
  );
}
