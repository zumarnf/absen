import { formatDatePDF, getDayName, getShiftTimeRanges } from "@/lib/helpers";
import type { Attendance, UserInfo } from "@/types";

interface GeneratePDFParams {
  attendances: Attendance[];
  user: UserInfo;
}

/**
 * Generate a PDF attendance report for a user.
 * Uses jsPDF and jspdf-autotable (dynamically imported).
 */
export async function generateAttendancePDF({
  attendances,
  user,
}: GeneratePDFParams): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();

  const totalHours = attendances.reduce((sum, att) => sum + att.totalHours, 0);

  const tableBody: any[][] = [];

  // Title row
  tableBody.push([
    {
      content:
        "PRESENSI KEHADIRAN STUDENT STAFF UNIT LOGISTIK DAN MANAJEMEN ASET",
      colSpan: 7,
      styles: {
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
        valign: "middle",
        cellPadding: 6,
      },
    },
  ]);

  // Name row
  tableBody.push([
    {
      content: `${user.nama}`,
      colSpan: 7,
      styles: {
        fontStyle: "bold",
        fontSize: 9,
        halign: "start",
        valign: "middle",
        cellPadding: 5,
      },
    },
  ]);

  // Column headers
  tableBody.push([
    {
      content: "NO",
      styles: {
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        fontSize: 8,
      },
    },
    {
      content: "TANGGAL",
      styles: {
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        fontSize: 8,
      },
    },
    {
      content: "Hari",
      styles: {
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        fontSize: 8,
      },
    },
    {
      content: "JAM",
      styles: {
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        fontSize: 8,
      },
    },
    {
      content: "DURASI\nWAKTU",
      styles: {
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        fontSize: 8,
      },
    },
    {
      content: "KEGIATAN",
      styles: {
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        fontSize: 8,
      },
    },
    {
      content: "TANDA\nTANGAN",
      styles: {
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        fontSize: 8,
      },
    },
  ]);

  // Data rows
  attendances.forEach((att, index) => {
    const jamValue = att.totalHours > 0 ? getShiftTimeRanges(att.shifts) : "";

    tableBody.push([
      {
        content: (index + 1).toString(),
        styles: { halign: "center", valign: "middle", fontSize: 8 },
      },
      {
        content: formatDatePDF(att.date),
        styles: { halign: "center", valign: "middle", fontSize: 8 },
      },
      {
        content: getDayName(att.date),
        styles: { halign: "center", valign: "middle", fontSize: 8 },
      },
      {
        content: jamValue,
        styles: { halign: "center", valign: "middle", fontSize: 7 },
      },
      {
        content: `${att.totalHours} Jam`,
        styles: { halign: "center", valign: "middle", fontSize: 8 },
      },
      {
        content:
          "Menjaga dan melayani permintaan peralatan kebutuhan perkuliahan",
        styles: { halign: "left", valign: "middle", fontSize: 7 },
      },
      {
        content: "",
        styles: { halign: "center", valign: "middle", minCellHeight: 18 },
      },
    ]);
  });

  // Total row
  tableBody.push([
    {
      content: "",
      colSpan: 4,
      styles: { halign: "center", valign: "middle" },
    },
    {
      content: "TOTAL JAM",
      styles: {
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        fontSize: 8,
      },
    },
    {
      content: `${totalHours} Jam`,
      styles: {
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        fontSize: 8,
      },
    },
    {
      content: "",
      styles: { halign: "center", valign: "middle" },
    },
  ]);

  // Render table
  autoTable(doc, {
    startY: 15,
    body: tableBody,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 4,
      lineColor: [0, 0, 0],
      lineWidth: 0.4,
      textColor: [0, 0, 0],
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 24 },
      2: { cellWidth: 18 },
      3: { cellWidth: 32 },
      4: { cellWidth: 22 },
      5: { cellWidth: 46 },
      6: { cellWidth: 24 },
    },
    showHead: "never",
  });

  // Signature block
  const finalY = (doc as any).lastAutoTable.finalY;
  const pageWidth = doc.internal.pageSize.getWidth();
  const signatureX = pageWidth - 70;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Disetujui Oleh,", signatureX, finalY + 18);

  doc.setFont("helvetica", "bold");
  doc.text("Reza Dwi Rahman", signatureX, finalY + 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("KaBag Logistik & Aset Manajemen", signatureX, finalY + 45);

  // Save file
  const fileName = `Presensi_${user.nama.replace(/\s+/g, "_")}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
}
