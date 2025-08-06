// // Utility for PDF generation using html2pdf.js

// export async function htmlToPdfBlob(html) {
//   return new Promise((resolve, reject) => {
//     const element = document.createElement('div');
//     element.innerHTML = html;
//     document.body.appendChild(element);
//     window.html2pdf().set({
//       html2canvas: {
//         scale: 3,         // Higher DPI
//         useCORS: true,    // For images
//         allowTaint: false // For security
//       },
//       jsPDF: {
//         unit: 'pt',
//         format: 'a4',
//         orientation: 'portrait',
//         precision: 16     // More accurate rendering
//       }
//     })
//       .from(element)
//       .outputPdf('blob')
//       .then(blob => {
//         document.body.removeChild(element);
//         resolve(blob);
//       })
//       .catch(err => {
//         document.body.removeChild(element);
//         reject(err);
//       });
//   });
// } 


export async function htmlToPdfBlob(html) {
  return new Promise((resolve, reject) => {
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.position = 'absolute';
    hiddenContainer.style.left = '-9999px';
    hiddenContainer.style.visibility = 'hidden';

    const element = document.createElement('div');
    element.innerHTML = html;
    hiddenContainer.appendChild(element);
    document.body.appendChild(hiddenContainer);

    const options = {
      html2canvas: {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false // Disable console logging
      },
      jsPDF: {
        unit: 'pt',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    window.html2pdf()
      .set(options)
      .from(element)
      .outputPdf('blob')
      .then(blob => {
        document.body.removeChild(hiddenContainer);
        resolve(blob);
      })
      .catch(err => {
        document.body.removeChild(hiddenContainer);
        reject(err);
      });
  });
}