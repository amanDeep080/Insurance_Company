package com.surakshacover.dto;

import lombok.Data;

@Data
public class ClaimReviewRequest {
    private String status; // approved, rejected, under_review
    private String reviewNotes;
}
