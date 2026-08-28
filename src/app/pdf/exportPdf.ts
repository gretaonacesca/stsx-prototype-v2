import { jsPDF } from "jspdf";
import { toJpeg } from "html-to-image";
import html2canvas from "html2canvas";

export type PageOrientation = "portrait" | "landscape";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Rasterize one laid-out page element to a JPEG data URL. */
async function rasterizePage(el: HTMLElement): Promise<string> {
  // Prefer html-to-image — preserves SVG chart text far better than html2canvas.
  try {
    return await toJpeg(el, {
      quality: 0.92,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
      includeQueryParams: true,
      filter: (node) => {
        if (!(node instanceof HTMLElement)) return true;
        if (node.dataset.pdfExportHide != null) return false;
        return true;
      },
    });
  } catch {
    // Fallback if fonts/CORS block html-to-image
    const canvas = await (html2canvas as (el: HTMLElement, opts?: object) => Promise<HTMLCanvasElement>)(el, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      imageTimeout: 15000,
      ignoreElements: (node: Element) =>
        node instanceof HTMLElement && node.dataset.pdfExportHide != null,
    });
    return canvas.toDataURL("image/jpeg", 0.92);
  }
}

/** Capture each A4 page element; orientations[i] must match page i. */
export async function exportPagesToPdf(
  pageEls: HTMLElement[],
  orientations: PageOrientation[],
  filename = "stsx-report.pdf",
  onProgress?: (current: number, total: number) => void,
) {
  if (pageEls.length === 0) return;

  // Let charts / fonts finish painting at full page size
  await delay(250);

  const firstOrient = orientations[0] ?? "portrait";
  const pdf = new jsPDF({ orientation: firstOrient, unit: "mm", format: "a4" });

  for (let i = 0; i < pageEls.length; i++) {
    onProgress?.(i + 1, pageEls.length);
    const el = pageEls[i];
    const orient = orientations[i] ?? "portrait";

    // Ensure the node has real layout (not sr-only / 0×0)
    const rect = el.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 40) {
      throw new Error(
        `PDF page ${i + 1} has no layout (${Math.round(rect.width)}×${Math.round(rect.height)}). Cannot rasterize.`
      );
    }

    const img = await rasterizePage(el);
    if (i > 0) pdf.addPage("a4", orient);
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    pdf.addImage(img, "JPEG", 0, 0, pageW, pageH);
  }

  pdf.save(filename);
}
