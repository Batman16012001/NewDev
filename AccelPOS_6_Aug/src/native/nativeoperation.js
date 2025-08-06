import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


export async function openCamera(path, fileName) {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64
    });
    if (path != "" && fileName != "") {
      const fileNameSave = fileName;// new Date().getTime() + '.jpeg';
      const savedFile = await Filesystem.writeFile({
        path: fileNameSave,
        data: photo.base64String,
        directory: path
      });

    }
    return photo.base64String;
  } catch (error) {
    console.error('Error opening camera:', error);
  }
};

export async function createDirectory(directory_name) {
  try {
    await Filesystem.mkdir({
      path: directory_name,
      directory: Directory.Data, // App-specific internal storage
      recursive: true
    });

  } catch (error) {
    if (error.message !== 'Directory exists') {
      console.error('Error creating directory:', error);
    }
  }
};

export async function writeFile(fileName, content) {
  try {
    await Filesystem.writeFile({
      path: fileName,
      data: content,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });

  } catch (error) {
      console.error('Error creating directory:', error);
  }
};

export async function readImagePdfFile(fileName){
  try {
    const result = await Filesystem.readFile({
      path: fileName, // Path to the file in the storage
      directory: Directory.Data,
    });
    let pdfUrl = `${result.data}`;
    //console.log('File read successfully:', pdfUrl);
    return pdfUrl;
  } catch (error) {
    console.error('Error reading file:', error);
  }
};

export async function readTextFile (path) {
  try {
    const result = await Filesystem.readFile({
      path: path,
      directory: Directory.Data, // App-specific internal storage
      encoding: Encoding.UTF8
    });
   return result.data ;
  } catch (error) {
    console.error('Error reading file:', error);
  }
};


export async function readPublicFile (path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const text = await response.text();
    return text;
   // setFileContent(text);
  } catch (error) {
    console.error('Error fetching the file:', error);
  }
};

export async function writePublicFile(path, data) {
  try {
    await Filesystem.writeFile({
      path: path,
      data: data,
      encoding: Encoding.UTF8,
    });
    console.log('File written successfully');
  } catch (error) {
    console.error('Error writing the file:', error);
  }
}

export async function readServerFile(filePath) {
  try {
    const response = await fetch(`http://localhost:3000/read-file?path=${encodeURIComponent(filePath)}`);
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    const data = await response.json();
    console.log('File content:', data.content);
    return data.content;
  } catch (error) {
    console.error('Error reading file:', error);
  }
}


export async function writeServerFile(filePath, content) {
  try {
    const response = await fetch('http://localhost:3000/write-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: filePath, content: content }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    const data = await response.json();
    console.log('File write response:', data.message);
    return data.message;
  } catch (error) {
    console.error('Error writing file:', error);
  }
}


export async function listFilesInDirectory(directoryPath) {
  try {
    const result = await Filesystem.readdir({
      path: directoryPath,
      directory: Directory.Data,
    });
    return result.files;
  } catch (error) {
    console.error('Error listing files:', error);
  }
}
