package com.surakshacover.service;

import com.surakshacover.dto.PaymentRequest;
import com.surakshacover.dto.PaymentResponse;
import com.surakshacover.entity.Customer;
import com.surakshacover.entity.Policy;
import com.surakshacover.entity.PremiumPayment;
import com.surakshacover.exception.ApiException;
import com.surakshacover.repository.CustomerRepository;
import com.surakshacover.repository.PolicyRepository;
import com.surakshacover.repository.PremiumPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PremiumPaymentRepository paymentRepository;
    private final PolicyRepository policyRepository;
    private final CustomerRepository customerRepository;

    private PaymentResponse toResponse(PremiumPayment p) {
        Policy policy = policyRepository.findById(p.getPolicyId()).orElse(null);
        String policyNumber = policy != null ? policy.getPolicyNumber() : "—";
        String customerName = policy != null
                ? customerRepository.findById(policy.getCustomerId()).map(c -> c.getName()).orElse("Unknown")
                : "Unknown";
        return new PaymentResponse(p, policyNumber, customerName);
    }

    public List<PaymentResponse> list(Long policyId, String status) {
        List<PremiumPayment> payments;
        if (policyId != null) payments = paymentRepository.findByPolicyId(policyId);
        else if (status != null) payments = paymentRepository.findByPaymentStatus(status);
        else payments = paymentRepository.findAll();
        return payments.stream().map(this::toResponse).toList();
    }

    // Scopes results to only payments on policies belonging to the logged-in customer.
    public List<PaymentResponse> listForCustomerUser(Long userId) {
        Customer customer = customerRepository.findByUserId(userId).orElse(null);
        if (customer == null) return List.of();
        List<Long> policyIds = policyRepository.findByCustomerId(customer.getId()).stream().map(Policy::getId).toList();
        if (policyIds.isEmpty()) return List.of();
        return paymentRepository.findByPolicyIdIn(policyIds).stream().map(this::toResponse).toList();
    }

    public PaymentResponse record(PaymentRequest request) {
        if (request.getPolicyId() == null || request.getAmount() == null || request.getDueDate() == null) {
            throw new ApiException("policyId, amount, and dueDate are required.", HttpStatus.BAD_REQUEST);
        }
        PremiumPayment payment = PremiumPayment.builder()
                .policyId(request.getPolicyId())
                .amount(request.getAmount())
                .dueDate(request.getDueDate())
                .paymentStatus("due")
                .build();
        return toResponse(paymentRepository.save(payment));
    }

    public PaymentResponse markPaid(Long id) {
        PremiumPayment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ApiException("Payment not found.", HttpStatus.NOT_FOUND));
        payment.setPaymentStatus("paid");
        payment.setPaymentDate(LocalDateTime.now());
        return toResponse(paymentRepository.save(payment));
    }
}
