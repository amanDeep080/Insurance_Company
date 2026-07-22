package com.surakshacover.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {
    private Long policyId;
    private BigDecimal amount;
    private LocalDate dueDate;
}
