import React from 'react';

function ConfirmDialog({ isOpen, onConfirm, message }) {
    if (!isOpen) return null;

    return (
        <div className="confirm-dialog" onClick={() => onConfirm(false)}>
            <div className="confirm-dialog-content" onClick={e => e.stopPropagation()}>
                <p>{message}</p>
                <button onClick={() => onConfirm(true)}>Oui</button>
                <button onClick={() => onConfirm(false)}>Non</button>
            </div>
        </div>
    );
}

export default ConfirmDialog;
