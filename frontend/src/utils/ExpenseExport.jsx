import React, { useState, useRef, useEffect } from "react";
import { FileDown, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
} from "docx";
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
  if (n == null || n === "") return "";
  return Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const headers = [
  "Sr.", "Tx ID", "Date", "Company", "Type", "Department",
  "Counterparty", "Description", "Account", "Amount",
  "Currency", "FX", "INR Amount", "Country",
];

const ExpenseExport = ({ data, fileName = "ExpenseInquiries" }) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Load custom font for Cyrillic support
  useEffect(() => {
    const loadFont = async () => {
      try {
        // Try to load Noto Sans font (supports Cyrillic)
        const fontUrl = '/fonts/NotoSans-Regular.ttf';
        const response = await fetch(fontUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = function(e) {
          const fontBase64 = e.target.result.split(',')[1];
          // Add font to jsPDF
          jsPDF.API.events.push([
            'addFonts', function(doc) {
              doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64);
              doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
              doc.setFont('NotoSans');
            }
          ]);
          setFontLoaded(true);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error loading custom font:", error);
        // Fallback to default font
        setFontLoaded(true);
      }
    };
    
    loadFont();
  }, []);

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }

    const rows = data.map((e, index) => [
      index + 1,
      e.transactionId || "",
      fmtDate(e.date),
      e.company || "",
      e.type || "",
      e.department || "",
      e.counterparty || "",
      e.description || "",
      e.account || "",
      fmtNum(e.amount),
      e.currency || "INR",
      e.fx ?? 1,
      fmtNum(e.inrAmount),
      e.country || "",
    ]);

    if (format === "pdf") {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      
      // Set font if loaded
      if (fontLoaded) {
        try {
          doc.setFont('NotoSans');
        } catch(e) {
          console.log("Font not available, using default");
        }
      }
      
      // Add header with logo
      try {
        const logoResponse = await fetch('/newlogo.png');
        const logoBlob = await logoResponse.blob();
        const logoReader = new FileReader();
        
        const addLogoAndHeader = (logoDataUrl) => {
          if (logoDataUrl) {
            doc.addImage(logoDataUrl, 'PNG', margin, 5, 35, 27);
          }
          
          // Company name
          doc.setFontSize(22);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(75, 0, 130);
          doc.text('SubDuxion', pageWidth - margin, 15, { align: 'right' });
          
          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text('Financial Export Report', pageWidth - margin, 23, { align: 'right' });
          
          // Title
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('Expense Inquiries', margin, 40);
          
          doc.setFontSize(8);
          doc.setFont(undefined, 'normal');
          doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, margin, 47);
          doc.text(`Total Records: ${data.length}`, margin, 53);
          
          // Decorative line
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(margin, 58, pageWidth - margin, 58);
        };
        
        logoReader.onload = (e) => {
          addLogoAndHeader(e.target.result);
        };
        logoReader.readAsDataURL(logoBlob);
        
        // If logo fails, still add header
        setTimeout(() => {
          if (!logoReader.result) {
            addLogoAndHeader(null);
          }
        }, 100);
        
      } catch(e) {
        // Add header without logo
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(75, 0, 130);
        doc.text('SubDuxion', pageWidth - margin, 15, { align: 'right' });
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Financial Export Report', pageWidth - margin, 23, { align: 'right' });
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Expense Inquiries', margin, 40);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, margin, 47);
        doc.text(`Total Records: ${data.length}`, margin, 53);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, 58, pageWidth - margin, 58);
      }
      
      // Add table with optimized column widths
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 62,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 7.5,
          cellPadding: 3,
          font: fontLoaded ? 'NotoSans' : 'helvetica',
          overflow: 'linebreak',
          cellWidth: 'wrap',
          valign: 'middle',
        },
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [75, 0, 130],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center',
          valign: 'middle',
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 25 },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 28 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 30 },
          7: { cellWidth: 35 },
          8: { cellWidth: 28 },
          9: { cellWidth: 22, halign: 'right' },
          10: { cellWidth: 15, halign: 'center' },
          11: { cellWidth: 15, halign: 'right' },
          12: { cellWidth: 25, halign: 'right' },
          13: { cellWidth: 20 },
        },
        didDrawPage: (data) => {
          // Footer
          const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
          const totalPages = doc.internal.getNumberOfPages();
          const exportTime = new Date();
          const formattedTime = exportTime.toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          
          doc.setFontSize(7);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(128, 128, 128);
          doc.text(`Exported: ${formattedTime}`, margin, pageHeight - 8);
          doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
          
          // Decorative line
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.2);
          doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        },
      });
      
      // Add small delay to ensure header is drawn
      setTimeout(() => {
        doc.save(`${fileName}.pdf`);
      }, 200);
    }

    if (format === "xlsx") {
      const worksheetData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      
      const colWidths_arr = [6, 15, 12, 15, 12, 15, 18, 25, 18, 12, 8, 8, 12, 12];
      ws['!cols'] = colWidths_arr.map(w => ({ wch: w }));
      
      const numericCols = [9, 11, 12];
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = 1; R <= range.e.r; R++) {
        numericCols.forEach((C) => {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (ws[addr]) {
            ws[addr].t = "n";
            ws[addr].z = "#,##0.00";
          }
        });
      }
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Expense Inquiries");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    }

    if (format === "docx") {
      const tableRows = [
        new TableRow({
          children: headers.map((h) =>
            new TableCell({
              width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: h, bold: true })],
            })
          ),
        }),
        ...rows.map((row) =>
          new TableRow({
            children: row.map((cell) =>
              new TableCell({ children: [new Paragraph(String(cell))] })
            ),
          })
        ),
      ];
      const docFile = new Document({
        sections: [{ children: [new Table({ rows: tableRows })] }],
      });
      const blob = await Packer.toBlob(docFile);
      saveAs(blob, `${fileName}.docx`);
    }
  };

  return (
    <div ref={exportRef} className="relative w-full">
      <div
        onClick={() => setExportOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition cursor-pointer"
      >
        <FileDown size={16} />
        Export
        <ChevronDown
          size={13}
          className="ml-auto opacity-50 transition-transform"
          style={{ transform: exportOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>

      {exportOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <div
            onClick={() => { handleExport("pdf"); setExportOpen(false); }}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-800 transition cursor-pointer"
          >
            PDF (.pdf)
          </div>
          <div className="border-t border-gray-100" />
          <div
            onClick={() => { handleExport("xlsx"); setExportOpen(false); }}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-800 transition cursor-pointer"
          >
            Excel (.xlsx)
          </div>
          <div className="border-t border-gray-100" />
          <div
            onClick={() => { handleExport("docx"); setExportOpen(false); }}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-800 transition cursor-pointer"
          >
            Word (.docx)
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseExport;