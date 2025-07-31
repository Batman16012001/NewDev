// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const Template = ({ pdfBlobUrl }) => {
//     const navigate = useNavigate();

//     const exithtml=()=>{
//         navigate('/signaturecapture')
//     }


//   return (
//     <div>
//       <h2>PDF Viewer</h2>
//       <button type="button" class="btn btn-primary" onClick={exithtml}>Exit</button>
//       {pdfBlobUrl ? (
//         <iframe src={pdfBlobUrl} width="100%" height="600px" title="PDF Viewer"></iframe>
//       ) : (
//         <p>Loading PDF...</p>
//       )}
//     </div>
//   );
// };

// export default Template;
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Capacitor } from '@capacitor/core';
import "./Template.css"

const Template = ({ pdfBlobUrl }) => {
  const navigate = useNavigate();

  const exitHandler = () => {
    navigate(-1);
  };

  useEffect(() => {
    // const openPdfInAndroid = async () => {
    //   if (pdfBlobUrl) {
    //     try {
    //       // Fetch the PDF as a blob
    //       const response = await fetch(pdfBlobUrl);
    //       const blob = await response.blob();

    //       // Convert blob to base64
    //       const reader = new FileReader();
    //       reader.onloadend = async () => {
    //         const base64data = reader.result.split(',')[1];

    //         // Write the PDF file to Documents folder (external storage)
    //         const fileName = 'sample.pdf';
    //         await Filesystem.writeFile({
    //           path: fileName,
    //           data: base64data,
    //           directory: Directory.ExternalStorage, // Write to external storage (Android)
    //           recursive: true,
    //         });

    //         // Construct the correct absolute file path for opening the PDF
    //         const filePath = `file:///storage/emulated/0/Documents/${fileName}`;  // Absolute path for external storage

    //         console.log('File Path:', filePath);  // Debugging the file path

    //         // Open the file with the native PDF viewer
    //         await FileOpener.open({
    //           filePath: filePath,  // Absolute file path to open
    //           contentType: 'application/pdf',
    //         });
    //       };
    //       reader.readAsDataURL(blob);
    //     } catch (error) {
    //       console.error('Error opening PDF on Android:', error);
    //     }
    //   }
    // };

    const openPdfInAndroid = async () => {
          if (pdfBlobUrl) {
            try {
              // Fetch the PDF as a blob
              const response = await fetch(pdfBlobUrl);
              const blob = await response.blob();
    
              // Convert blob to Base64
              const reader = new FileReader();
              reader.onloadend = async () => {
                const base64data = reader.result.split(',')[1];
                console.log('Base64 Data:', base64data);
    
                // Define the subfolder and generate a unique file name
                const folderName = 'MyAppFiles'; // Subfolder name inside Documents
                const fileName = `sample_${Date.now()}.pdf`; // Unique file name using timestamp
    
                // Ensure the subfolder exists inside Documents
                try {
                  await Filesystem.mkdir({
                    path: folderName,
                    directory: Directory.Documents,
                    recursive: true,
                  });
                } catch (error) {
                  if (error.message !== 'Directory exists') {
                    console.error('Error creating directory:', error);
                    return;
                  }
                }
    
                try {
                  // Write the PDF to the subfolder with a unique file name
                  const writeResult = await Filesystem.writeFile({
                    path: `${folderName}/${fileName}`, // Save file in the subfolder with unique name
                    data: base64data,
                    directory: Directory.Documents,
                    recursive: true,
                  });
    
                  console.log('Write Result:', writeResult);
    
                  // Get the absolute URI of the file
                  const fileUri = await Filesystem.getUri({
                    path: `${folderName}/${fileName}`,
                    directory: Directory.Documents,
                  });
    
                  console.log('File URI:', fileUri.uri);
    
                  // Open the file using the native PDF viewer
                  await FileOpener.open({
                    filePath: fileUri.uri, // Absolute path of the file
                    contentType: 'application/pdf',
                  });
                } catch (fileError) {
                  console.error('Error writing or opening file:', fileError);
                }
              };
    
              reader.readAsDataURL(blob);
            } catch (error) {
              console.error('Error opening PDF on Android:', error);
            }
          }
        };
    // Only open PDF on Android (or based on platform)
    if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
      openPdfInAndroid();
    }
  }, [pdfBlobUrl]);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
        document.body.classList.add("ios-safeareasubmission");
      } else {
        document.body.classList.remove("ios-safeareasafeareasubmission");
      }


  return (
    <>
    <div className="safearea safearea-top"></div>
    <div className='iosmargintop'>
      <h5 className='text-center'>Proposal Preview Pdf</h5>
      <button type="button" className="btn btn-danger" onClick={exitHandler}>
        Exit
      </button>
      {pdfBlobUrl ? (
        <iframe src={pdfBlobUrl} width="100%" height="600px" title="PDF Viewer"></iframe>
      ) : (
        <p>Loading PDF...</p>
      )}
    </div>
    <div className="safearea safearea-bottom"></div>

      </>

  );
};

export default Template;






