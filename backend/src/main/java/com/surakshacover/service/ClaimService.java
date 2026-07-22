package com.surakshacover.service;

import com.surakshacover.dto.ClaimRequest;
import com.surakshacover.dto.ClaimResponse;
import com.surakshacover.entity.Claim;
import com.surakshacover.entity.Customer;
import com.surakshacover.entity.Policy;
import com.surakshacover.exception.ApiException;
import com.surakshacover.repository.ClaimRepository;
import com.surakshacover.repository.CustomerRepository;
import com.surakshacover.repository.PolicyRepository;
import com.surakshacover.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final CustomerRepository customerRepository;

    private ClaimResponse toResponse(Claim c) {
        Policy policy = policyRepository.findById(c.getPolicyId()).orElse(null);
        String policyNumber = policy != null ? policy.getPolicyNumber() : "—";
        String customerName = policy != null
                ? customerRepository.findById(policy.getCustomerId()).map(cu -> cu.getName()).orElse("Unknown")
                : "Unknown";
        return new ClaimResponse(c, policyNumber, customerName);
    }

    public List<ClaimResponse> list(String status) {
        List<Claim> claims = status != null ? claimRepository.findByStatus(status) : claimRepository.findAll();
        return claims.stream().map(this::toResponse).toList();
    }

    // Scopes results to only claims on policies belonging to the logged-in customer.
    public List<ClaimResponse> listForCustomerUser(Long userId) {
        Customer customer = customerRepository.findByUserId(userId).orElse(null);
        if (customer == null) return List.of();
        List<Long> policyIds = policyRepository.findByCustomerId(customer.getId()).stream().map(Policy::getId).toList();
        if (policyIds.isEmpty()) return List.of();
        return claimRepository.findByPolicyIdIn(policyIds).stream().map(this::toResponse).toList();
    }

    public ClaimResponse get(Long id) {
        return toResponse(findEntity(id));
    }

    public Claim findEntity(Long id) {
        return claimRepository.findById(id)
                .orElseThrow(() -> new ApiException("Claim not found.", HttpStatus.NOT_FOUND));
    }

    public ClaimResponse submit(ClaimRequest request) {
        if (request.getPolicyId() == null || request.getClaimAmount() == null || request.getReason() == null) {
            throw new ApiException("policyId, claimAmount, and reason are required.", HttpStatus.BAD_REQUEST);
        }
        Claim claim = Claim.builder()
                .policyId(request.getPolicyId())
                .claimAmount(request.getClaimAmount())
                .reason(request.getReason())
                .status("pending")
                .build();
        return toResponse(claimRepository.save(claim));
    }

    public ClaimResponse review(Long id, String status, String reviewNotes, AuthenticatedUser actor) {
        List<String> allowed = List.of("approved", "rejected", "under_review");
        if (!allowed.contains(status)) {
            throw new ApiException("Invalid status.", HttpStatus.BAD_REQUEST);
        }
        Claim claim = findEntity(id);
        claim.setStatus(status);
        claim.setReviewNotes(reviewNotes);
        claim.setReviewedBy(actor.id());
        claim.setReviewedAt(LocalDateTime.now());
        return toResponse(claimRepository.save(claim));
    }
}
