package com.surakshacover.dto;

import com.surakshacover.entity.Claim;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class ClaimResponse {
    private final Long id;
    private final Long policyId;
    private final String policyNumber;
    private final String customerName;
    private final BigDecimal claimAmount;
    private final String reason;
    private final String status;
    private final String reviewNotes;
    private final LocalDateTime submissionDate;
    private final LocalDateTime reviewedAt;

    public ClaimResponse(Claim c, String policyNumber, String customerName) {
        this.id = c.getId();
        this.policyId = c.getPolicyId();
        this.policyNumber = policyNumber;
        this.customerName = customerName;
        this.claimAmount = c.getClaimAmount();
        this.reason = c.getReason();
        this.status = c.getStatus();
        this.reviewNotes = c.getReviewNotes();
        this.submissionDate = c.getSubmissionDate();
        this.reviewedAt = c.getReviewedAt();
    }
}
