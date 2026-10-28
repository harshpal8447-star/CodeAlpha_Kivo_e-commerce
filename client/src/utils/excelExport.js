import * as XLSX from 'xlsx';

/**
 * Exports JSON array of objects to a downloadable Microsoft Excel (.xlsx) file
 * with auto-sized column widths, clean header styling, and timestamped filename.
 * 
 * @param {Array<Object>} data - Array of row objects to export
 * @param {string} fileName - Base filename (e.g. 'kivo_customer_orders')
 * @param {string} sheetName - Excel tab/worksheet name (e.g. 'Order History')
 */
export const exportToExcel = (data, fileName = 'kivo_export', sheetName = 'Sheet1') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  try {
    // 1. Create a new empty workbook
    const workbook = XLSX.utils.book_new();

    // 2. Convert JSON data to Worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 3. Auto-fit column widths based on maximum cell content length
    const objectKeys = Object.keys(data[0] || {});
    const colWidths = objectKeys.map((key) => {
      let maxLen = key.toString().length;
      data.forEach((row) => {
        const val = row[key];
        if (val !== undefined && val !== null) {
          const strLen = val.toString().length;
          if (strLen > maxLen) maxLen = strLen;
        }
      });
      // Add padding and constrain between 12 and 50 characters
      return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
    });

    worksheet['!cols'] = colWidths;

    // 4. Append sheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

    // 5. Generate timestamped file name
    const timestamp = new Date().toISOString().slice(0, 10);
    const fullFileName = `${fileName}_${timestamp}.xlsx`;

    // 6. Trigger direct browser download
    XLSX.writeFile(workbook, fullFileName);
  } catch (error) {
    console.error('Failed to export Excel spreadsheet:', error);
    // Fallback: Export as formatted UTF-8 CSV
    exportToCSV(data, fileName);
  }
};

/**
 * Fallback CSV Exporter with UTF-8 BOM for universal Excel compatibility
 */
export const exportToCSV = (data, fileName = 'kivo_export') => {
  if (!data || !Array.isArray(data) || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header] === null || row[header] === undefined ? '' : row[header];
        const stringified = String(val).replace(/"/g, '""');
        return `"${stringified}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
