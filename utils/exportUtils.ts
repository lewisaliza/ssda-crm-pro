
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${filename}.csv`);
};

export const exportToExcel = (data: any[], filename: string) => {
    if (!data.length) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
};

export const exportToPDF = (
    data: any[],
    columns: { header: string, dataKey: string }[],
    title: string,
    filename: string
) => {
    const doc = new jsPDF();

    const date = new Date().toLocaleDateString();
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${date}`, 14, 22);

    autoTable(doc, {
        head: [columns.map(col => col.header)],
        body: data.map(row => columns.map(col => row[col.dataKey])),
        startY: 25,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 133, 244] }, // Blue header
        alternateRowStyles: { fillColor: [245, 247, 250] } // Light gray
    });

    doc.save(`${filename}.pdf`);
};
