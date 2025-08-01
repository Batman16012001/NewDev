import React from 'react'
import "./ValidationErrorModal.css"
import { Modal , Button } from 'react-bootstrap'

const ValidationErrorModal = ({ show, onClose, message }) => {
  return (
    <div>
      <Modal show={show} onHide={onClose} backdrop="static" centered>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    </div>
  )
}

export default ValidationErrorModal
