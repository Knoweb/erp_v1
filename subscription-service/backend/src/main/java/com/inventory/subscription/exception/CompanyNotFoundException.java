package com.inventory.subscription.exception;

public class CompanyNotFoundException extends RuntimeException {
    public CompanyNotFoundException(String message) {
        super(message);
    }

    public CompanyNotFoundException(Long orgId) {
        super("Company not found with orgId: " + orgId);
    }
}
