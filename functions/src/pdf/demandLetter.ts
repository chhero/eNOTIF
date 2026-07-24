import PDFDocument from "pdfkit";
import { getStorage } from "firebase-admin/storage";
import type { LeaseDoc } from "../types";

/** Generates a demand letter PDF for an overdue lease and returns it as a Buffer. */
export function generateDemandLetterPdf(
  lease: Pick<LeaseDoc, "flaNumber" | "applicantName" | "annualRental" | "dueDate" | "assignedPenro">,
  penalty: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

    doc
      .fontSize(14)
      .text("Department of Environment and Natural Resources", { align: "center" })
      .fontSize(11)
      .text("Region VIII", { align: "center" })
      .moveDown(2)
      .fontSize(11)
      .text(today, { align: "right" })
      .moveDown()
      .text(lease.applicantName)
      .moveDown()
      .text("Subject: DEMAND LETTER - Overdue Annual Rental for Foreshore Lease Agreement")
      .moveDown()
      .text(`Dear ${lease.applicantName},`)
      .moveDown()
      .text(
        `Our records show that the annual rental for your Foreshore Lease Agreement No. ${lease.flaNumber}, ` +
          `which was due on ${lease.dueDate}, remains unpaid as of the date of this letter.`
      )
      .moveDown()
      .text(`Amount Due: PHP ${lease.annualRental.toLocaleString()}`)
      .text(`Penalty: PHP ${penalty.toLocaleString()}`)
      .text(`Total Amount Due: PHP ${(lease.annualRental + penalty).toLocaleString()}`)
      .moveDown()
      .text(
        `You are hereby required to settle your outstanding balance with the ${lease.assignedPenro} ` +
          `within fifteen (15) days from receipt of this letter. Failure to do so may result in further ` +
          `action, including but not limited to cancellation of your lease agreement.`
      )
      .moveDown(2)
      .text("Very truly yours,")
      .moveDown(2)
      .text(`${lease.assignedPenro}`)
      .text("Department of Environment and Natural Resources");

    doc.end();
  });
}

/** Uploads the demand letter PDF to Cloud Storage and returns a long-lived signed download URL. */
export async function uploadDemandLetterPdf(leaseId: string, pdfBuffer: Buffer): Promise<string> {
  const bucket = getStorage().bucket();
  const filePath = `demand-letters/${leaseId}/${Date.now()}.pdf`;
  const file = bucket.file(filePath);

  await file.save(pdfBuffer, { contentType: "application/pdf" });

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "01-01-2100",
  });

  return url;
}
