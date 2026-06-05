package com.example.GinumApps;

import com.example.GinumApps.exception.CompanyExistsException;
import com.example.GinumApps.exception.DuplicateEntityException;
import com.example.GinumApps.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;
import java.util.ConcurrentModificationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CompanyExistsException.class)
    public ResponseEntity<String> handleCompanyExists(CompanyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDenied() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
    }

    @ExceptionHandler(DuplicateEntityException.class)
    public ResponseEntity<String> handleDuplicateEntity(DuplicateEntityException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<String> handleIOException(IOException ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("File processing error: " + ex.getMessage());
    }

    @ExceptionHandler(ConcurrentModificationException.class)
    public ResponseEntity<String> handleConcurrentModification(
            ConcurrentModificationException ex
    ) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalState(IllegalStateException ex) {
        if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("overpayment")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Amount paid cannot exceed the total bill amount");
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(org.springframework.dao.DataIntegrityViolationException ex) {
        String rootMsg = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        if (rootMsg != null && rootMsg.contains("Duplicate entry") && 
            (rootMsg.contains("purchase_orders") || rootMsg.contains("UKf4jya7nmnvj96qae0o9ecspgn") || rootMsg.contains("po_number"))) {
            
            ErrorResponse error = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                "Conflict",
                "This PO Number already exists. Please refresh or generate a new PO Number."
            );
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            rootMsg != null ? rootMsg : "Data integrity violation occurred."
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    public static class ErrorResponse {
        private int status;
        private String error;
        private String message;

        public ErrorResponse(int status, String error, String message) {
            this.status = status;
            this.error = error;
            this.message = message;
        }

        public int getStatus() { return status; }
        public String getError() { return error; }
        public String getMessage() { return message; }
        
        public void setStatus(int status) { this.status = status; }
        public void setError(String error) { this.error = error; }
        public void setMessage(String message) { this.message = message; }
    }
}

