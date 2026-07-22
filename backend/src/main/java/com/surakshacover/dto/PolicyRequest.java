package com.surakshacover.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PolicyRequest {
    private Long customerId;
    private String policyType;
    private BigDecimal premiumAmount;
    private BigDecimal sumAssured;
    private LocalDate startDate;
    private LocalDate endDate;
}
