import React, { useState ,useEffect} from 'react';
//import { Camera, CameraResultType } from '@capacitor/camera';

import { openCamera ,writeFile , createDirectory,readImagePdfFile,
  readTextFile,readPublicFile,readFile,writePublicFile,writeServerFile,
  listFilesInDirectory} from '../native/nativeoperation';



const AboutPage = () => {




    const [imageUrl, setImageUrl] = useState(null);

    const open= async () => {
      let path = "";
      let fileName = ""
      let test = await openCamera(path,fileName) ; 
     setImageUrl(test);
    }

    const readTheServerFile= async () => {
    const fileUrl = '../example_one.txt'; // Replace with your file URL
    //readServerFile(fileUrl);
    //readFile("example.txt");
    //writeServerFile(fileUrl,"this is one")
    listFilesInDirectory("/myDir");
    }
    const readTheFile= async () => {
      let path = "";
      let fileName = "/example.txt"
     //await writeFile("/my/set/name/abc.txt","This hi bye") ; 
    // await createDirectory("/myDir")
    //readImagePdfFile("/mydirect/eCeylief.png");

    //readTextFile(fileName);

    }

    

  return (
    <div>
      <h1>About </h1>
    <div>

  </div>
  </div>
  );
  
};

export default AboutPage;
