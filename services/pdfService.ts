import html2pdf from 'html2pdf.js';

export const generatePdf = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    const opt = {
      margin:       0.5,
      filename:     `${filename}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  } else {
    console.error('Element not found for PDF generation');
  }
};
