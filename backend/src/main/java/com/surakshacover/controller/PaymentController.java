package com.surakshacover.controller;

import com.surakshacover.dto.PaymentRequest;
import com.surakshacover.dto.PaymentResponse;
import com.surakshacover.security.AuthenticatedUser;
import com.surakshacover.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> list(@RequestParam(required = false) Long policyId,
                                                        @RequestParam(required = false) String status,
                                                        @AuthenticationPrincipal AuthenticatedUser actor) {
        if ("customer".equals(actor.role())) {
            return ResponseEntity.ok(paymentService.listForCustomerUser(actor.id()));
        }
        return ResponseEntity.ok(paymentService.list(policyId, status));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<PaymentResponse> record(@RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.record(request));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<PaymentResponse> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.markPaid(id));
    }
}
