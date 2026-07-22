package com.surakshacover.controller;

import com.surakshacover.dto.ClaimRequest;
import com.surakshacover.dto.ClaimResponse;
import com.surakshacover.dto.ClaimReviewRequest;
import com.surakshacover.security.AuthenticatedUser;
import com.surakshacover.service.ClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @GetMapping
    public ResponseEntity<List<ClaimResponse>> list(@RequestParam(required = false) String status,
                                                      @AuthenticationPrincipal AuthenticatedUser actor) {
        if ("customer".equals(actor.role())) {
            return ResponseEntity.ok(claimService.listForCustomerUser(actor.id()));
        }
        return ResponseEntity.ok(claimService.list(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.get(id));
    }

    @PostMapping
    public ResponseEntity<ClaimResponse> submit(@RequestBody ClaimRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(claimService.submit(request));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ClaimResponse> review(@PathVariable Long id, @RequestBody ClaimReviewRequest request,
                                                 @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(claimService.review(id, request.getStatus(), request.getReviewNotes(), actor));
    }
}
