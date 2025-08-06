import React, { useEffect, useState } from "react";
import { findRecordById } from "../../../db/indexedDB";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import "./PreviewUpload.css";

const PreviewUpload = () => {
    const navigate = useNavigate()
    const docID = sessionStorage.getItem("docId");
    const [imageData, setImageData] = useState({});

    useEffect(() => {
        const fetchImages = async () => {
            const imagedata = await findRecordById("al_document_details", docID);
            console.log("Images on preview:::", imagedata.result);
            setImageData(imagedata.result); // Save the data for rendering
        };
        fetchImages();
    }, [docID]);

    const backhandler = () =>{
        navigate('/documentcapture')
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
          document.body.classList.add("ios-safeareasubmission");
        } else {
          document.body.classList.remove("ios-safeareasubmission");
        }

    const renderDocuments = (documents = []) => {
        console.log("Documents:::",documents)
        return documents.map((doc, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
                <img 
                    src={
                        Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios'
                            ? (doc.base64Content.startsWith("data:image")
                                ? doc.base64Content // Use the existing Base64 string if it has the prefix
                                : `data:image/jpeg;base64,${doc.base64Content}`) // Add the prefix only if missing
                            : doc.base64Content
                    }
                    alt={doc.documentName || "Uploaded Document"} 
                    style={{ width: "200px", height: "200px", objectFit: "cover", marginBottom: "10px" }} 
                />
                <div style={{ textAlign: "center" }}>{doc.documentName}</div>
            </div>
        ));
    };

    const renderInsuredSection = (insured, title) => {
        if (!insured) return null;

        return (
            <div style={{ marginBottom: "30px" }}>
                <h5 >{title}</h5>
                {insured.documents.map((detail, index) => (
                    <div key={index} className="col-md-4 col-12 outputbox mt-2">
                        <h5 className="text-center">{detail.documentType}</h5>
                        <div className="text-center" style={{ display: "block", gap: "10px", flexWrap: "wrap" }}>
                            {renderDocuments(detail.documents)}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
    <div className="safearea safearea-top"></div>
        <div style={{ padding: "20px" }}>
            <button className="btn btn-danger" onClick={backhandler}>Back</button>
            <h2 className="text-center">Preview Uploaded Documents</h2>

            {/* Render Primary Insured */}
            {renderInsuredSection(imageData.primaryInsured, "LifeA")}

            {/* Render Secondary Insured */}
            {renderInsuredSection(imageData.secondaryInsured, "LifeB")}

            {/* Render Children Insured */}
            {Array.from({ length: 5 }, (_, i) => {
                const key = `${["first", "second", "third", "fourth", "fifth"][i]}ChildInsured`;
                return renderInsuredSection(imageData[key], `${["first", "second", "third", "fourth", "fifth"][i]} Child Insured`);
            })}
        </div>
        <div className="safearea safearea-bottom"></div>
        </>
    );
};

export default PreviewUpload;
