import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

type Placement = {
  area: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: { text?: string; src?: string };
};

type Design = {
  title: string;
  placements: Placement[];
  palette: string[];
};

export default function App() {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [design, setDesign] = useState<Design | null>(null);
  const [brief, setBrief] = useState("Vintage travel collage for Goa trip");

  useEffect(() => {
    if (!canvasElRef.current) return;
    const c = new fabric.Canvas(canvasElRef.current, {
      width: 600,
      height: 720,
      backgroundColor: "#0b0b0b"
    });
    canvasRef.current = c;
    return () => {
      c.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !design) return;
    const c = canvasRef.current;
    c.clear();
    // background
    c.setBackgroundColor("#0b0b0b", () => c.renderAll());

    // render palette chips
    design.palette.forEach((p, i) => {
      const rect = new fabric.Rect({
        left: 10 + i * 42,
        top: 10,
        width: 36,
        height: 18,
        fill: p,
        selectable: false
      });
      c.add(rect);
    });

    // render placements
    design.placements.forEach((pl) => {
      if (pl.type === "text" && pl.content.text) {
        const text = new fabric.Textbox(pl.content.text, {
          left: pl.x,
          top: pl.y,
          width: pl.width,
          fontSize: 28,
          fill: "#fff",
          selectable: false,
          fontFamily: "Inter, system-ui, sans-serif"
        });
        c.add(text);
      } else if (pl.type === "image" && pl.content.src) {
        fabric.Image.fromURL(pl.content.src, (img) => {
          img.set({
            left: pl.x,
            top: pl.y,
            scaleX: pl.width / img.width!,
            scaleY: pl.height / img.height!,
            selectable: false
          });
          c.add(img);
          c.sendToBack(img);
        }, { crossOrigin: 'anonymous' });
      } else {
        // placeholder rect
        const rect = new fabric.Rect({
          left: pl.x,
          top: pl.y,
          width: pl.width,
          height: pl.height,
          fill: "rgba(255,255,255,0.04)",
          stroke: "#D4AF37",
          strokeWidth: 1.5,
          selectable: false
        });
        c.add(rect);
      }
    });
    c.renderAll();
  }, [design]);

  async function generateDesign() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief })
      });
      const json = await res.json();
      setDesign(json.design);
    } catch (err) {
      console.error(err);
      alert("Failed to call mock server. Is it running on port 3001?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 text-white">
      <header className="flex items-center justify-between">
        <div className="text-2xl font-semibold">SOYL</div>
        <nav className="space-x-6">
          <a>Product</a>
          <a>About</a>
          <a>Careers</a>
        </nav>
      </header>

      <main className="mt-10 grid grid-cols-2 gap-8">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">Story Of Your Life</h1>
          <p className="max-w-lg">
            Craft timeless, elite designs from memories. Minimal, exclusive, museum-grade keepsakes.
          </p>

          <div className="mt-4">
            <label className="block text-sm mb-2">Design brief</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              className="w-full p-3 rounded bg-white/5"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateDesign}
              disabled={loading}
              className="px-6 py-3 rounded-md border border-[#D4AF37] bg-transparent text-[#D4AF37]"
            >
              {loading ? "Generating..." : "Generate Design (mock)"}
            </button>

            <button
              onClick={() => {
                if (!canvasRef.current) return;
                const data = canvasRef.current.toDataURL({ format: "png" });
                const w = window.open("");
                if (w) w.document.write(`<img src="${data}" />`);
              }}
              className="px-6 py-3 rounded-md border border-gray-400/30 bg-white/5"
            >
              Export Preview
            </button>
          </div>
        </section>

        <section className="bg-white/5 p-6 rounded-lg">
          <div className="mb-4 text-sm text-gray-300">Canvas preview (mock)</div>
          <canvas ref={canvasElRef} width={600} height={720} />
        </section>
      </main>
    </div>
  );
}