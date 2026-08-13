import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export type PageOrientation = "portrait" | "landscape";

/** Capture each A4 page element; orientations[i] must match page i. */
export async function exportPagesToPdf(
  pageEls: HTMLElement[],
  orientations: PageOrientation[],
  filename = "stsx-report.pdf"
) {
  const firstOrient = orientations[0] ?? "portrait";
  const pdf = new jsPDF({ orientation: firstOrient, unit: "mm", format: "a4" });

  for (let i = 0; i < pageEls.length; i++) {
    const el = pageEls[i];
    const orient = orientations[i] ?? "portrait";
    const canvas = await (html2canvas as (el: HTMLElement, opts?: object) => Promise<HTMLCanvasElement>)(el, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    const img = canvas.toDataURL("image/jpeg", 0.92);
    if (i > 0) pdf.addPage("a4", orient);
    // After addPage, page size matches orientation
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    pdf.addImage(img, "JPEG", 0, 0, pageW, pageH);
  }

  pdf.save(filename);
}
