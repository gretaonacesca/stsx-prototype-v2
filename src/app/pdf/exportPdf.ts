import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/** Capture each A4 page element and stitch into a multi-page PDF download. */
export async function exportPagesToPdf(pageEls: HTMLElement[], filename = "stsx-report.pdf") {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pageEls.length; i++) {
    const el = pageEls[i];
    const canvas = await (html2canvas as (el: HTMLElement, opts?: object) => Promise<HTMLCanvasElement>)(el, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    const img = canvas.toDataURL("image/jpeg", 0.92);
    if (i > 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 0, 0, pageW, pageH);
  }

  pdf.save(filename);
}
