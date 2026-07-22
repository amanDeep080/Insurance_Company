package com.surakshacover.dto;

import com.surakshacover.entity.Policy;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class PolicyResponse {
    private final Long id;
    private final Long customerId;
    private final String customerName;
    private final String policyType;
    private final String policyNumber;
    private final BigDecimal premiumAmount;
    private final BigDecimal sumAssured;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String status;
    private final LocalDateTime createdAt;

    public PolicyResponse(Policy p, String customerName) {
        this.id = p.getId();
        this.customerId = p.getCustomerId();
        this.customerName = customerName;
        this.policyType = p.getPolicyType();
        this.policyNumber = p.getPolicyNumber();
        this.premiumAmount = p.getPremiumAmount();
        this.sumAssured = p.getSumAssured();
        this.startDate = p.getStartDate();
        this.endDate = p.getEndDate();
        this.status = p.getStatus();
        this.createdAt = p.getCreatedAt();
    }
}
