import PDFDocument from "pdfkit";
import { getStorage } from "firebase-admin/storage";
import type { LeaseDoc } from "../types";

/** Generates a demand letter PDF for an overdue lease and returns it as a Buffer. */
export function generateDemandLetterPdf(
  lease: Pick<LeaseDoc, "flaNumber" | "applicantName" | "annualRental" | "dueDate" | "assignedPenro">,
  penalty: number,
  responseDays: number = 15
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Republic of the Philippines", { align: "center" })
      .fontSize(13)
      .text("Department of Environment and Natural Resources", { align: "center" })
      .fontSize(11)
      .text("Region VIII Eastern Visayas", { align: "center" })
      .font("Helvetica")
      .fontSize(10)
      .text("Sto. Niño Extension, Tacloban City", { align: "center" })
      .moveDown(0.5);

    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .lineWidth(1)
      .strokeColor("#15803d")
      .stroke()
      .moveDown(1.5);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(today, { align: "right" })
      .moveDown()
      .text(lease.applicantName)
      .moveDown()
      .font("Helvetica-Bold")
      .text("Subject: DEMAND LETTER - Overdue Annual Rental for Foreshore Lease Agreement")
      .font("Helvetica")
      .moveDown()
      .text(`Dear ${lease.applicantName},`)
      .moveDown()
      .text(
        `Our records show that the annual rental for your Foreshore Lease Agreement No. ${lease.flaNumber}, ` +
          `which was due on ${lease.dueDate}, remains unpaid as of the date of this letter.`
      )
      .moveDown();

    doc
      .font("Helvetica-Bold")
      .text("Amount Due:", { continued: true })
      .font("Helvetica")
      .text(` PHP ${lease.annualRental.toLocaleString()}`)
      .font("Helvetica-Bold")
      .text("Penalty:", { continued: true })
      .font("Helvetica")
      .text(` PHP ${penalty.toLocaleString()}`)
      .font("Helvetica-Bold")
      .text("Total Amount Due:", { continued: true })
      .font("Helvetica")
      .text(` PHP ${(lease.annualRental + penalty).toLocaleString()}`)
      .moveDown()
      .text(
        `You are hereby required to settle your outstanding balance with the ${lease.assignedPenro} ` +
          `within ${responseDays} day${responseDays === 1 ? "" : "s"} from receipt of this letter. Failure to do so may result in further ` +
          `action, including but not limited to cancellation of your lease agreement.`
      )
      .moveDown(2)
      .text("Very truly yours,")
      .moveDown(2)
      .font("Helvetica-Bold")
      .text(`${lease.assignedPenro}`)
      .font("Helvetica")
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
