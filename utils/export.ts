// Function to trigger download of a CSV file
export const exportToCsv = (filename: string, rows: (string | number)[][]) => {
  const processRow = (row: (string | number)[]): string => {
    return row.map(val => {
      const str = String(val).replace(/"/g, '""');
      // Quote fields containing commas, double quotes, or newlines
      if (/[",\n]/.test(str)) {
        return `"${str}"`;
      }
      return str;
    }).join(',');
  };

  const csvContent = rows.map(processRow).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
