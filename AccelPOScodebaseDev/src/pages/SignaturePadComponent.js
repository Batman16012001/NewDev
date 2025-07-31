// import React from 'react';

// const SignaturePadComponent = () => {
//   React.useEffect(() => {
//     // Load and inject signature pad HTML into the React component
//     fetch('/path-to/SignaturePad.html')
//       .then(response => response.text())
//       .then(html => {
//         document.getElementById('signature-container').innerHTML = html;
//       });
//   }, []);

//   return <div><h1>Signature Pad</h1><div id="signature-container"></div></div>;
// };

// export default SignaturePadComponent;



import React, { useRef ,useEffect} from 'react';
import SignaturePad from 'signature_pad';


const SignaturePadComponent = () => {

      const canvasRef = useRef(null);
      const signaturePadRef = useRef(null);
    
      useEffect(() => {
        if (canvasRef.current) {
          signaturePadRef.current = new SignaturePad(canvasRef.current);
        }
      }, []);
    
      const clearSignature = () => {
        if (signaturePadRef.current) {
          signaturePadRef.current.clear();
        }
      };
    
      const saveSignature = async () => {
        if (signaturePadRef.current) {
          const dataURL = signaturePadRef.current.toDataURL('image/png');
          
          // Save or handle the dataURL
          try {
            const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
    
           //Write the base64 into file
         
    
            console.log('Signature saved successfully.');
          } catch (error) {
            console.error('Error saving signature:', error);
          }
        }
      };
    
      return (
        <div>
          <h1>Signature Pad</h1>
          <canvas ref={canvasRef} width={600} height={300} style={{ border: '1px solid #000' }} />
          <button onClick={clearSignature}>Clear</button>
          <button onClick={saveSignature}>Save</button>
        </div>
      );
    
    

    
};

export default SignaturePadComponent;
