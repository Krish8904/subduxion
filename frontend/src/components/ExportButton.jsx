import React from "react";
import { FileDown } from "lucide-react";   
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from "docx";
import { saveAs } from "file-saver";

const ExportButton = ({ data }) => {

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = ["Sr.", "Main Content", "Subtext/Description", "Alignment", "Order", "Custom"];
    const rows = data.map((row, idx) => [
      idx + 1,
      row.primary || "",
      row.secondary || "",
      row.align || "",
      row.pos || "",
      row.isCustom ? "Yes" : "No",
    ]);

    // ✅ PDF (UNCHANGED STYLE)
    if (format === "pdf") {
      const doc = new jsPDF();

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 15,
        styles: { fontSize: 10, cellPadding: 3 },
      });

      doc.save("HomeSections.pdf");
    }

    // ✅ Excel
    if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(
        data.map((row, idx) => ({
          Sr: idx + 1,
          "Main Content": row.primary || "",
          "Subtext/Description": row.secondary || "",
          Alignment: row.align || "",
          Order: row.pos || "",
          Custom: row.isCustom ? "Yes" : "No",
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Home Sections");
      XLSX.writeFile(wb, "HomeSections.xlsx");
    }

    // ✅ Word
    if (format === "docx") {
      const tableRows = [
        new TableRow({
          children: headers.map((h) =>
            new TableCell({
              width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: h, bold: true })],
            })
          ),
        }),
        ...rows.map((r) =>
          new TableRow({
            children: r.map((cell) =>
              new TableCell({ children: [new Paragraph(cell.toString())] })
            ),
          })
        ),
      ];

      const doc = new Document({
        sections: [{ children: [new Table({ rows: tableRows })] }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "HomeSections.docx");
    }
  };

  return (<><div className="relative inline-block group">
    {/* Blue button */}
    <div className="p-2 border-2 border-blue-600 hover:bg-blue-700   flex px-4 bg-blue-600 text-white rounded-lg cursor-pointer">
      Export <span className="pl-3 pt-0.5"><FileDown size={18} /></span>
    </div>

    {/* Dropdown on hover */}
    <div className="absolute left-0 w-44 bg-white border rounded-lg shadow-lg hidden group-hover:block z-50">
      <div
        onClick={() => handleExport("pdf")}
        className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
      >
        Pdf (.pdf)
      </div>
      <div
        onClick={() => handleExport("xlsx")}
        className="px-4 py-2 hover:bg-gray-100  cursor-pointer"
      >
        Excel (.xlsx)
      </div>
      <div
        onClick={() => handleExport("docx")}
        className="px-4 py-2 hover:bg-gray-100 rounded-b-lg cursor-pointer"
      >
        Word (.docx)
      </div>
    </div>
  </div>
  </>


  );
};

export default ExportButton;
