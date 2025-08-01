import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import "./SubmissionPreview.css"

const SubmissionPreview = () => {
    const navigate = useNavigate();

    // useEffect(() => {
    //     const fetchData = async () =>{

    //     };
    //     fetchData()
    // }, []);
    const handleSQSPreview = () =>{
        navigate('/quotationoutput')
    }

    const handleProposalPreview = ()=>{
        navigate('/proposaloutput')
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
          document.body.classList.add("ios-safeareasubmission");
        } else {
          document.body.classList.remove("ios-safeareasafeareasubmission");
        }

    return (
        <>
        <div className="safearea safearea-top"></div>
            <div className='container iosmargintopsubmission'>
                <div className='row d-flex justify-content-between iosmargintop'>
                    <div className='mb-3'>
                        <button type='button' className='btn btn-danger' onClick={handleSQSPreview}>SQS Preview</button>
                    </div>
                    <div className='mb-3'>
                        <button type='button' className='btn btn-danger' onClick={handleProposalPreview}>Proposal Preview</button>
                    </div>
                    <div className='mb-3'>
                        <button type='button' className='btn btn-danger' onClick={()=>navigate(-1)}>Exit</button>
                    </div>
                </div>
            </div>
            <div className="safearea safearea-bottom"></div>
        </>

    )
}

export default SubmissionPreview
