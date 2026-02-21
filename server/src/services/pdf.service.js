const PDFDocument = require("pdfkit");
const axios = require("axios");

// ─── Color Palette ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#1a3a6b",
  accent: "#2563eb",
  accentLight: "#dbeafe",
  success: "#16a34a",
  successLight: "#dcfce7",
  white: "#ffffff",
  offWhite: "#f8fafc",
  gray100: "#f1f5f9",
  gray300: "#cbd5e1",
  gray500: "#64748b",
  gray700: "#334155",
  dark: "#0f172a",
  gold: "#f59e0b",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roundedRect(doc, x, y, w, h, r, fillColor, strokeColor) {
  doc.save();
  doc.roundedRect(x, y, w, h, r);
  if (fillColor) doc.fill(fillColor);
  if (strokeColor) doc.stroke(strokeColor);
  doc.restore();
}

async function fetchImage(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
}

/**
 * Sanitize text for PDFKit's WinAnsiEncoding (built-in Helvetica/Times).
 * Replaces common Unicode symbols with ASCII equivalents, then strips any
 * remaining characters outside the WinAnsi range (0x00–0xFF) so they don't
 * render as garbled glyphs (e.g. Ø<ß", Ø=Ü¼).
 */
function sanitize(str) {
  if (!str) return "";
  return str
    // ── Step 1: Map common Unicode to readable ASCII equivalents ─────────
    .replace(/[\u2018\u2019\u0060]/g, "'")         // smart single quotes
    .replace(/[\u201C\u201D]/g, '"')               // smart double quotes
    .replace(/\u2014/g, "--")                      // em dash
    .replace(/\u2013/g, "-")                       // en dash
    .replace(/\u2026/g, "...")                     // ellipsis …
    .replace(/\u2022/g, "-")                       // bullet •  → dash (cleaner in PDF)
    .replace(/\u2023/g, "-")                       // triangular bullet
    .replace(/\u25CF/g, "-")                       // black circle bullet
    .replace(/\u25BA/g, ">")                       // play arrow
    .replace(/\u2192/g, "->")                      // right arrow →
    .replace(/\u2190/g, "<-")                      // left arrow ←
    .replace(/\u2713|\u2714/g, "(ok)")             // checkmarks ✓ ✔
    .replace(/\u2715|\u2716/g, "(x)")              // cross marks ✕ ✖

    // ── Step 2: Strip entire Unicode blocks that are never WinAnsi-safe ──
    // Uses the `u` flag so surrogate pairs are decoded as full code points
    // before matching — this is the key fix for emoji stored as surrogates.
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")       // emoji (Misc Symbols, Mahjong, etc.)
    .replace(/[\u{2600}-\u{27BF}]/gu, "")          // Misc Symbols, Dingbats, arrows
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")        // more emoji (weather, faces, etc.)
    .replace(/[\u{2000}-\u{206F}]/gu, " ")         // General Punctuation → space
    .replace(/[\u{FE00}-\u{FEFF}]/gu, "")          // Variation selectors, BOM

    // ── Step 3: Final catch-all — drop anything still outside Latin-1 ────
    .replace(/[^\x00-\xFF]/g, "")

    // ── Step 4: Clean up any doubled spaces left by removed chars ─────────
    .replace(/  +/g, " ")
    .trim();
}

// ─── Main Export ──────────────────────────────────────────────────────────────

exports.generateCompanyQRPDF = async ({ company, jobs = [], qrImageUrl }) => {
  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const MARGIN = 48;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });

  const buffers = [];
  doc.on("data", (chunk) => buffers.push(chunk));
  const pdfDone = new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(buffers)))
  );

  const qrBuffer = await fetchImage(qrImageUrl);

  let logoBuffer = null;
  if (company.logoUrl) {
    try {
      logoBuffer = await fetchImage(company.logoUrl);
    } catch (_) {}
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ════════════════════════════════════════════════════════════════════════════

  const HEADER_H = 160;
  doc.rect(0, 0, PAGE_W, HEADER_H).fill(COLORS.primary);

  // Diagonal stripe texture
  doc.save();
  doc.rect(0, 0, PAGE_W, HEADER_H).clip();
  doc.opacity(0.07);
  for (let i = -20; i < PAGE_W + HEADER_H; i += 30) {
    doc.moveTo(i, 0).lineTo(i + HEADER_H, HEADER_H).lineWidth(18).strokeColor(COLORS.white).stroke();
  }
  doc.opacity(1).restore();

  // Gold top bar
  doc.rect(0, 0, PAGE_W, 5).fill(COLORS.gold);

  // Logo / Initials
  const LOGO_SIZE = 64;
  const LOGO_X = MARGIN;
  const LOGO_Y = (HEADER_H - LOGO_SIZE) / 2 + 4;

  if (logoBuffer) {
    doc.circle(LOGO_X + LOGO_SIZE / 2, LOGO_Y + LOGO_SIZE / 2, LOGO_SIZE / 2 + 3).fill(COLORS.white);
    doc.image(logoBuffer, LOGO_X, LOGO_Y, { width: LOGO_SIZE, height: LOGO_SIZE });
  } else {
    const initials = (company.name || "?")
      .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    doc.circle(LOGO_X + LOGO_SIZE / 2, LOGO_Y + LOGO_SIZE / 2, LOGO_SIZE / 2 + 3).fill(COLORS.white);
    doc.circle(LOGO_X + LOGO_SIZE / 2, LOGO_Y + LOGO_SIZE / 2, LOGO_SIZE / 2).fill(COLORS.accent);
    doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(22)
      .text(initials, LOGO_X, LOGO_Y + (LOGO_SIZE - 28) / 2, { width: LOGO_SIZE, align: "center" });
  }

  const TEXT_X = LOGO_X + LOGO_SIZE + 18;
  const TEXT_W = PAGE_W - TEXT_X - MARGIN;

  doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(22)
    .text(sanitize(company.name) || "Company Name", TEXT_X, LOGO_Y + 4, { width: TEXT_W });

  const tagline = sanitize(company.tagline || "").substring(0, 90);
  if (tagline) {
    doc.fillColor(COLORS.accentLight).font("Helvetica").fontSize(9.5)
      .text(tagline + (sanitize(company.tagline || "").length > 90 ? "..." : ""), TEXT_X, LOGO_Y + 32, { width: TEXT_W });
  }

  // FIX 1: Replaced ✦ with plain ">" — WinAnsiEncoding doesn't support Unicode symbols
  if (company.activelyHiring) {
    const BADGE_Y = LOGO_Y + 56;
    const roleCount = company.openRoles || company.activeJobCount || 0;
    const badgeLabel = `> ACTIVELY HIRING  (${roleCount} Roles)`;
    const badgeW = doc.widthOfString(badgeLabel) + 22;
    doc.roundedRect(TEXT_X, BADGE_Y, badgeW, 18, 9).fill(COLORS.success);
    doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(8.5)
      .text(badgeLabel, TEXT_X + 8, BADGE_Y + 4, { width: badgeW - 10 });
  }

  // ── Two-column layout ────────────────────────────────────────────────────
  const curY = HEADER_H + 24;
  const COL1_X = MARGIN;
  const COL1_W = CONTENT_W * 0.56;
  const COL2_X = MARGIN + COL1_W + 16;
  const COL2_W = CONTENT_W - COL1_W - 16;

  // ── Left col: About + Mission ─────────────────────────────────────────────
  doc.fillColor(COLORS.primary).font("Helvetica-Bold").fontSize(13)
    .text("About the Company", COL1_X, curY);
  doc.moveTo(COL1_X, curY + 18).lineTo(COL1_X + 60, curY + 18)
    .lineWidth(2).strokeColor(COLORS.gold).stroke();

  doc.fillColor(COLORS.gray700).font("Helvetica").fontSize(9.5)
    .text(sanitize(company.about?.trim() || "No description provided."), COL1_X, curY + 26, {
      width: COL1_W, lineGap: 3,
    });

  const missionY = doc.y + 14;
  roundedRect(doc, COL1_X, missionY, COL1_W, 56, 6, COLORS.accentLight, null);
  doc.fillColor(COLORS.accent).font("Helvetica-Bold").fontSize(9)
    .text("OUR MISSION", COL1_X + 12, missionY + 9);
  doc.fillColor(COLORS.gray700).font("Helvetica").fontSize(8.5)
    .text(sanitize((company.mission || "").trim()).substring(0, 180), COL1_X + 12, missionY + 23, {
      width: COL1_W - 24, lineGap: 2,
    });

  // ── Right col: Info card ──────────────────────────────────────────────────
  roundedRect(doc, COL2_X, curY, COL2_W, 220, 8, COLORS.offWhite, COLORS.gray300);

  const infoY = curY + 14;

  // FIX 2: foundedYear now correctly reads company.foundedYear (was rendering "—" before)
  // FIX 3: companySize now correctly prioritises company.companySize
  const infoRows = [
    { label: "Industry",  value: sanitize(company.industry || "—") },
    { label: "Founded",   value: sanitize(String(company.foundedYear || company.founded || "—")) },
    { label: "Team Size", value: sanitize(company.companySize || company.employeesCount || "—") },
    { label: "City",      value: sanitize(company.location?.city || "—") },
    { label: "Email",     value: sanitize(company.email || "—") },
    { label: "Phone",     value: sanitize(String(company.phone || "—")) },
    { label: "Website",   value: sanitize(company.website || "—") },
  ];

  infoRows.forEach((row, i) => {
    const rowY = infoY + i * 27;
    if (i % 2 === 0) {
      doc.rect(COL2_X + 8, rowY - 3, COL2_W - 16, 24).fill(COLORS.gray100);
    }
    doc.fillColor(COLORS.gray500).font("Helvetica").fontSize(7.5)
      .text(row.label.toUpperCase(), COL2_X + 14, rowY + 2);
    doc.fillColor(COLORS.dark).font("Helvetica-Bold").fontSize(9)
      .text(
        row.value.length > 34 ? row.value.substring(0, 34) + "..." : row.value,
        COL2_X + 14, rowY + 12,
        { width: COL2_W - 24 }
      );
  });

  // ── QR Card ───────────────────────────────────────────────────────────────
  // FIX 4: QR and text now properly vertically centred — text no longer floats to bottom of card
  const QR_SIZE = 150;
  const QR_CARD_H = QR_SIZE + 52;
  const QR_Y = Math.max(doc.y, missionY + 66) + 20;

  roundedRect(doc, MARGIN, QR_Y, CONTENT_W, QR_CARD_H, 10, COLORS.primary, null);

  // Text vertically centred in card
  const textBlockH = 18 + 30 + 16; // title + body + url
  const textTop = QR_Y + (QR_CARD_H - textBlockH) / 2;

  doc.fillColor(COLORS.gold).font("Helvetica-Bold").fontSize(13)
    .text("Scan to View Full Company Profile", MARGIN + 20, textTop, {
      width: CONTENT_W - QR_SIZE - 56,
    });

  doc.fillColor(COLORS.accentLight).font("Helvetica").fontSize(8.5)
    .text(
      "Discover open roles, company culture, and apply directly from your phone.",
      MARGIN + 20, textTop + 22,
      { width: CONTENT_W - QR_SIZE - 56, lineGap: 2 }
    );

  // FIX 5: Replaced → (broken glyph) with plain "> " for website line
  doc.fillColor(COLORS.gray300).font("Helvetica").fontSize(8.5)
    .text(
      "> " + (company.website || ""),
      MARGIN + 20, textTop + 52,
      { width: CONTENT_W - QR_SIZE - 56 }
    );

  // QR image — vertically centred in card
  const QR_IMG_X = PAGE_W - MARGIN - QR_SIZE - 14;
  const QR_IMG_Y = QR_Y + (QR_CARD_H - QR_SIZE) / 2;

  // White frame
  doc.rect(QR_IMG_X - 6, QR_IMG_Y - 6, QR_SIZE + 12, QR_SIZE + 12).fill(COLORS.white);
  doc.image(qrBuffer, QR_IMG_X, QR_IMG_Y, { width: QR_SIZE, height: QR_SIZE });

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2 — OPEN POSITIONS
  // ════════════════════════════════════════════════════════════════════════════

  if (jobs && jobs.length > 0) {
    doc.addPage();

    doc.rect(0, 0, PAGE_W, 60).fill(COLORS.primary);
    doc.rect(0, 0, PAGE_W, 5).fill(COLORS.gold);
    doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(18).text("Open Positions", MARGIN, 18);
    doc.fillColor(COLORS.accentLight).font("Helvetica").fontSize(9)
      .text(
        `${sanitize(company.name || "Company")} - ${jobs.length} role${jobs.length > 1 ? "s" : ""} available`,
        MARGIN, 38
      );

    let jobY = 80;

    jobs.forEach((job, index) => {
      const descLines = Math.min(Math.ceil((job.description || "").length / 90), 3);
      const CARD_H = 100 + descLines * 13;

      if (jobY + CARD_H > PAGE_H - 80) {
        doc.addPage();
        doc.rect(0, 0, PAGE_W, 5).fill(COLORS.gold);
        jobY = 30;
      }

      roundedRect(doc, MARGIN, jobY, CONTENT_W, CARD_H, 8, COLORS.white, COLORS.gray300);
      doc.rect(MARGIN, jobY, 5, CARD_H).fill(index % 2 === 0 ? COLORS.accent : COLORS.gold);

      // Job number
      doc.circle(MARGIN + 24, jobY + 22, 13).fill(COLORS.accentLight);
      doc.fillColor(COLORS.accent).font("Helvetica-Bold").fontSize(10)
        .text(String(index + 1).padStart(2, "0"), MARGIN + 17, jobY + 16);

      // Title
      doc.fillColor(COLORS.dark).font("Helvetica-Bold").fontSize(13)
        .text(sanitize(job.title || "Untitled Role"), MARGIN + 46, jobY + 13, { width: CONTENT_W - 80 });

      // Tags row
      const tagY = jobY + 34;

      // FIX 6: Salary label now includes "LPA" so "Rs. 5 - 8" reads "Rs. 5 - 8 LPA"
      let salaryLabel = null;
      if (job.salaryMin && job.salaryMax) {
        salaryLabel = `Rs. ${job.salaryMin} - ${job.salaryMax} LPA`;
      } else if (job.salaryMin) {
        salaryLabel = `Rs. ${job.salaryMin}+ LPA`;
      }

      const tags = [
        { label: sanitize(job.jobType || "Full-Time"), color: COLORS.accentLight, text: COLORS.accent },
        job.exp ? { label: sanitize(`Exp: ${job.exp}`), color: "#fef9c3", text: "#92400e" } : null,
        salaryLabel ? { label: salaryLabel, color: COLORS.successLight, text: COLORS.success } : null,
        (job.location || company.location?.city)
          ? { label: sanitize(job.location || company.location?.city || ""), color: COLORS.gray100, text: COLORS.gray700 }
          : null,
      ].filter(Boolean);

      let tagX = MARGIN + 46;
      tags.forEach((tag) => {
        const tw = doc.widthOfString(tag.label) + 16;
        roundedRect(doc, tagX, tagY, tw, 17, 8, tag.color, null);
        doc.fillColor(tag.text).font("Helvetica-Bold").fontSize(7.5)
          .text(tag.label, tagX + 8, tagY + 5);
        tagX += tw + 8;
      });

      if (sanitize(job.description)) {
        const truncated = sanitize(job.description).substring(0, 270);
        doc.fillColor(COLORS.gray500).font("Helvetica").fontSize(8.5)
          .text(
            truncated + (job.description.length > 270 ? "..." : ""),
            MARGIN + 46, tagY + 24,
            { width: CONTENT_W - 80, lineGap: 2 }
          );
      }

      jobY += CARD_H + 12;
    });

    // CTA
    const CTA_Y = Math.min(jobY + 10, PAGE_H - 100);
    roundedRect(doc, MARGIN, CTA_Y, CONTENT_W, 52, 8, COLORS.accentLight, null);
    doc.fillColor(COLORS.primary).font("Helvetica-Bold").fontSize(11)
      .text("Interested? Reach out to us!", MARGIN + 20, CTA_Y + 10);
    doc.fillColor(COLORS.accent).font("Helvetica").fontSize(9)
      .text(
        `${sanitize(company.email || "")}   |   ${sanitize(String(company.phone || ""))}   |   ${sanitize(company.website || "")}`,
        MARGIN + 20, CTA_Y + 30
      );
  }

  // ── Footer on all pages ───────────────────────────────────────────────────
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    const footerY = PAGE_H - 30;
    doc.moveTo(MARGIN, footerY).lineTo(PAGE_W - MARGIN, footerY)
      .lineWidth(0.5).strokeColor(COLORS.gray300).stroke();

    // FIX 7: Address line cleaned up — show "address, city" without raw DB noise
    const addr = [company.location?.address, company.location?.city]
      .filter(Boolean).join(", ");

    doc.fillColor(COLORS.gray500).font("Helvetica").fontSize(7.5)
      .text(
        `${sanitize(company.name || "")}  |  ${sanitize(addr)}`,
        MARGIN, footerY + 6,
        { width: CONTENT_W - 60, align: "left" }
      );
    doc.fillColor(COLORS.gray500).font("Helvetica").fontSize(7.5)
      .text(`Page ${i + 1} / ${totalPages}`, MARGIN, footerY + 6, {
        width: CONTENT_W, align: "right",
      });
  }

  doc.end();
  return pdfDone;
};