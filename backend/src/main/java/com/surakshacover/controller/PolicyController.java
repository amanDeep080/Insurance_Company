package com.surakshacover.controller;

import com.surakshacover.dto.PolicyRequest;
import com.surakshacover.dto.PolicyResponse;
import com.surakshacover.security.AuthenticatedUser;
import com.surakshacover.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @GetMapping
    public ResponseEntity<List<PolicyResponse>> list(@RequestParam(required = false) String status,
                                                       @RequestParam(required = false) Long customerId,
                                                       @AuthenticationPrincipal AuthenticatedUser actor) {
        if ("customer".equals(actor.role())) {
            return ResponseEntity.ok(policyService.listForCustomerUser(actor.id()));
        }
        return ResponseEntity.ok(policyService.list(status, customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PolicyResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.get(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<PolicyResponse> create(@RequestBody PolicyRequest request,
                                                  @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(policyService.create(request, actor));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<PolicyResponse> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(policyService.updateStatus(id, body.get("status")));
    }

    @PatchMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<PolicyResponse> renew(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(policyService.renew(id, LocalDate.parse(body.get("newEndDate"))));
    }
}
