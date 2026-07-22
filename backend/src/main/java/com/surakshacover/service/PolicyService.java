package com.surakshacover.service;

import com.surakshacover.dto.PolicyRequest;
import com.surakshacover.dto.PolicyResponse;
import com.surakshacover.entity.Customer;
import com.surakshacover.entity.Policy;
import com.surakshacover.exception.ApiException;
import com.surakshacover.repository.CustomerRepository;
import com.surakshacover.repository.PolicyRepository;
import com.surakshacover.security.AuthenticatedUser;
import com.surakshacover.util.PolicyNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final CustomerRepository customerRepository;

    private String customerName(Long customerId) {
        return customerRepository.findById(customerId).map(Customer::getName).orElse("Unknown");
    }

    private PolicyResponse toResponse(Policy p) {
        return new PolicyResponse(p, customerName(p.getCustomerId()));
    }

    public List<PolicyResponse> list(String status, Long customerId) {
        List<Policy> policies;
        if (status != null && customerId != null) policies = policyRepository.findByStatusAndCustomerId(status, customerId);
        else if (status != null) policies = policyRepository.findByStatus(status);
        else if (customerId != null) policies = policyRepository.findByCustomerId(customerId);
        else policies = policyRepository.findAll();

        return policies.stream().map(this::toResponse).toList();
    }

    // Scopes results to only the policies belonging to the logged-in customer.
    public List<PolicyResponse> listForCustomerUser(Long userId) {
        Customer customer = customerRepository.findByUserId(userId).orElse(null);
        if (customer == null) return List.of();
        return policyRepository.findByCustomerId(customer.getId()).stream().map(this::toResponse).toList();
    }

    public PolicyResponse get(Long id) {
        return toResponse(findEntity(id));
    }

    public Policy findEntity(Long id) {
        return policyRepository.findById(id)
                .orElseThrow(() -> new ApiException("Policy not found.", HttpStatus.NOT_FOUND));
    }

    public PolicyResponse create(PolicyRequest request, AuthenticatedUser actor) {
        if (request.getCustomerId() == null || request.getPolicyType() == null
                || request.getPremiumAmount() == null || request.getStartDate() == null || request.getEndDate() == null) {
            throw new ApiException("customerId, policyType, premiumAmount, startDate, and endDate are required.", HttpStatus.BAD_REQUEST);
        }
        Policy policy = Policy.builder()
                .customerId(request.getCustomerId())
                .policyType(request.getPolicyType())
                .policyNumber(PolicyNumberGenerator.generate(request.getPolicyType()))
                .premiumAmount(request.getPremiumAmount())
                .sumAssured(request.getSumAssured())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status("active")
                .createdBy(actor.id())
                .build();
        return toResponse(policyRepository.save(policy));
    }

    public PolicyResponse updateStatus(Long id, String status) {
        List<String> allowed = List.of("active", "expired", "cancelled", "pending");
        if (!allowed.contains(status)) {
            throw new ApiException("Invalid status.", HttpStatus.BAD_REQUEST);
        }
        Policy policy = findEntity(id);
        policy.setStatus(status);
        return toResponse(policyRepository.save(policy));
    }

    public PolicyResponse renew(Long id, LocalDate newEndDate) {
        Policy policy = findEntity(id);
        policy.setEndDate(newEndDate);
        policy.setStatus("active");
        return toResponse(policyRepository.save(policy));
    }
}
