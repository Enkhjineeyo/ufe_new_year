/** "5 минутын өмнө" маягийн хугацаа */
export function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return "Дөнгөж сая";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} минутын өмнө`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} цагийн өмнө`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} өдрийн өмнө`;
  return new Date(iso).toLocaleDateString("mn-MN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

/** Зургийг хөтөч дээр нь 1000px, JPEG болгон жижигрүүлнэ */
export function compressImage(file: File, maxSide = 1000, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Зөвхөн зураг оруулна уу."));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Зураг боловсруулж чадсангүй."));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Зураг уншиж чадсангүй."));
    };
    img.src = url;
  });
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Алдаа гарлаа.");
  return data as T;
}
