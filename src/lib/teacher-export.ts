import * as XLSX from "xlsx";
import Papa from "papaparse";

export function exportCSV(rows: Record<string, any>[], filename: string) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  download(blob, `${filename}.csv`);
}

export function exportXLSX(rows: Record<string, any>[], filename: string, sheet = "Report") {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function parseSpreadsheet(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      try {
        const isCsv = /\.csv$/i.test(file.name);
        if (isCsv) {
          const text = reader.result as string;
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
          resolve(parsed.data as Record<string, any>[]);
        } else {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: "array" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          resolve(XLSX.utils.sheet_to_json(sheet) as Record<string, any>[]);
        }
      } catch (e) {
        reject(e);
      }
    };
    if (/\.csv$/i.test(file.name)) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  });
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
