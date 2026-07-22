package com.surakshacover.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ClaimRequest {
    private Long policyId;
    private BigDecimal claimAmount;
    private String reason;
}
