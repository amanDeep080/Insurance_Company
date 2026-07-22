package com.surakshacover.dto;

import com.surakshacover.entity.PremiumPayment;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class PaymentResponse {
    private final Long id;
    private final Long policyId;
    private final String policyNumber;
    private final String customerName;
    private final BigDecimal amount;
    private final LocalDateTime paymentDate;
    private final LocalDate dueDate;
    private final String paymentStatus;

    public PaymentResponse(PremiumPayment p, String policyNumber, String customerName) {
        this.id = p.getId();
        this.policyId = p.getPolicyId();
        this.policyNumber = policyNumber;
        this.customerName = customerName;
        this.amount = p.getAmount();
        this.paymentDate = p.getPaymentDate();
        this.dueDate = p.getDueDate();
        this.paymentStatus = p.getPaymentStatus();
    }
}
