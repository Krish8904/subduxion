import React, { useState, useRef, useEffect } from "react";
import { FileDown, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, Table, TableCell, TableRow } from "docx";
import { saveAs } from "file-saver";

const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fmtNum = (n) => {
  if (n == null || n === "") return "0.00";
  return Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const val = (item) => {
  if (!item) return "";
  if (typeof item === "object") {
    return item.name || item.label || item.value || item.title || "—";
  }
  return item;
};

const headers = [
  "Sr.", "Tx ID", "Date", "Company", "Type", "Dept",
  "Counterparty", "Description", "Account", "Amount",
  "Curr", "FX", "INR Amount", "Country"
];

const pad = (n) => String(n).padStart(2, "0");
const fmtExportTime = () => {
  const t = new Date();
  return `${pad(t.getDate())}/${pad(t.getMonth() + 1)}/${t.getFullYear()} ${pad(t.getHours())}:${pad(t.getMinutes())}`;
};

async function fetchTTFBase64(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Rate limited or network error");
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    return btoa(binary);
  } catch { return null; }
}

async function registerNotoSans(doc) {
  const regularURL = "https://raw.githubusercontent.com/googlefonts/noto-fonts/master/hinted/ttf/NotoSans/NotoSans-Regular.ttf";
  const boldURL    = "https://raw.githubusercontent.com/googlefonts/noto-fonts/master/hinted/ttf/NotoSans/NotoSans-Bold.ttf";
  const [reg, bold] = await Promise.all([fetchTTFBase64(regularURL), fetchTTFBase64(boldURL)]);
  
  if (reg) { 
    doc.addFileToVFS("NotoSans-Regular.ttf", reg); 
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal"); 
  }
  if (bold) { 
    doc.addFileToVFS("NotoSans-Bold.ttf", bold); 
    doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold"); 
  }
  return !!reg;
}

const ExpenseExport = ({ data, fileName = "Expense_Report" }) => {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleExport = async (format) => {
    if (!data || data.length === 0) return alert("No data to export!");

    const rows = data.map((e, index) => [
      index + 1,
      val(e.transactionId),
      fmtDate(e.date),
      val(e.company),
      val(e.type),
      val(e.department),
      val(e.counterparty),
      val(e.description),
      val(e.account),
      fmtNum(e.amount),
      val(e.currency),
      e.fx ?? 1,
      e.inrAmount, // Raw number for color checking logic
      val(e.country),
    ]);

    if (format === "pdf") {
      const doc = new jsPDF("landscape", "mm", "a4");
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      
      let fontLoaded = false;
      try {
        fontLoaded = await registerNotoSans(doc);
      } catch (e) {
        console.warn("Font loading failed, falling back to Helvetica");
      }

      const bodyFont = fontLoaded ? "NotoSans" : "helvetica";

      const drawHeader = () => {
        // Indigo Top Accent
        doc.setFillColor(79, 70, 229); 
        doc.rect(0, 0, pageW, 1.5, "F");

        // White Header Area
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 1.5, pageW, 24, "F");

        // Enlarged Logo (Removed text)
        try { 
          doc.addImage("/newlogo.png", "PNG", 7, 2, 37, 28); 
        } catch { /* skip if missing */ }

        // CENTERED BLACK LARGER TEXT
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("CUSTOMER EXPENSE REPORT", pageW / 2, 16, { align: "center" });
        
        doc.setDrawColor(241, 245, 249);
        doc.line(10, 27, pageW - 10, 27); // Adjusted line for logo height
      };

      const drawFooter = (pageNum, totalPages) => {
        doc.setFont(bodyFont, "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Records: ${data.length}`, 12, pageH - 8);
        doc.text(`Exported on ${fmtExportTime()}`, pageW / 2, pageH - 8, { align: "center" });
        doc.text(`Page ${pageNum} / ${totalPages}`, pageW - 12, pageH - 8, { align: "right" });
      };

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 32, 
        margin: { top: 32, bottom: 15, left: 10, right: 10 },
        styles: {
          fontSize: 6.5,
          cellPadding: 2.5,
          font: bodyFont,
          textColor: [51, 65, 85],
          lineColor: [241, 245, 249],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [79, 70, 229], 
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [249, 251, 255],
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          9: { halign: "right" },
          12: { halign: "right", fontStyle: "bold" },
        },
        didParseCell: (cellData) => {
          if (cellData.section === 'body' && cellData.column.index === 12) {
            const rawVal = cellData.cell.raw;
            const numVal = parseFloat(rawVal) || 0;

            // Green for Gains (+), Red for Deficits (-)
            if (numVal < 0) {
              cellData.cell.styles.textColor = [220, 38, 38]; 
            } else if (numVal > 0) {
              cellData.cell.styles.textColor = [22, 163, 74];
            }
            
            // Format to string after logic check
            cellData.cell.text = [fmtNum(numVal)];
          }
        },
        didDrawPage: () => {
          drawHeader();
          drawFooter(doc.internal.getCurrentPageInfo().pageNumber, doc.internal.getNumberOfPages());
        },
      });
      doc.save(`${fileName}.pdf`);
    }

    const formattedRows = rows.map(r => {
        const processed = [...r];
        processed[12] = fmtNum(processed[12]);
        return processed;
    });

    if (format === "xlsx") {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...formattedRows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Expenses");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    }

    if (format === "docx") {
      const tableRows = [
        new TableRow({ children: headers.map(h => new TableCell({ children: [new Paragraph({ text: h, bold: true })] })) }),
        ...formattedRows.map(row => new TableRow({ children: row.map(cell => new TableCell({ children: [new Paragraph(String(cell))] })) }))
      ];
      const docFile = new Document({ sections: [{ children: [new Table({ rows: tableRows })] }] });
      const blob = await Packer.toBlob(docFile);
      saveAs(blob, `${fileName}.docx`);
    }
  };

  return (
    <div ref={exportRef} className="relative w-full">
      <button
        onClick={() => setExportOpen(!exportOpen)}
        className="w-full flex cursor-pointer items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-violet-50 rounded-lg hover:text-violet-800 transition shadow-sm border border-slate-200"
      >
        <FileDown size={16}/>
        Export
        <ChevronDown size={14} className={`ml-auto transition-transform ${exportOpen ? "rotate-180" : ""}`} />
      </button>

      {exportOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <button
            onClick={() => { handleExport("pdf"); setExportOpen(false); }}
            className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-800 transition border-b border-slate-100 cursor-pointer"
          >
            PDF (.pdf)
          </button>
          <button
            onClick={() => { handleExport("xlsx"); setExportOpen(false); }}
            className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-800 transition border-b border-slate-100 cursor-pointer"
          >
            Excel (.xlsx)
          </button>
          <button
            onClick={() => { handleExport("docx"); setExportOpen(false); }}
            className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-800 transition cursor-pointer"
          >
            Word (.docx)
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseExport;