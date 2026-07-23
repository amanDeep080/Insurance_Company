package com.surakshacover.service;

import com.surakshacover.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final PremiumPaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public Map<String, Object> dashboardSummary() {
        long activePolicies = policyRepository.countByStatus("active");
        long expiredPolicies = policyRepository.countByStatus("expired");
        long pendingClaims = claimRepository.countByStatus("pending");
        long customerCount = customerRepository.count();
        long pendingApprovals = userRepository.findByStatus("PENDING").size();

        BigDecimal premiumCollected = paymentRepository.findByPaymentStatus("paid").stream()
                .map(p -> p.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> claimStats = new LinkedHashMap<>();
        for (String status : new String[]{"pending", "approved", "rejected", "under_review"}) {
            claimStats.put(status, claimRepository.countByStatus(status));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("activePolicies", activePolicies);
        result.put("expiredPolicies", expiredPolicies);
        result.put("pendingClaims", pendingClaims);
        result.put("premiumCollected", premiumCollected);
        result.put("customerCount", customerCount);
        result.put("pendingApprovals", pendingApprovals);
        result.put("claimStats", claimStats);
        return result;
    }

    public Object monthlyPremiums() {
        // Groups paid premiums by month for the dashboard chart.
        Map<String, BigDecimal> totals = new LinkedHashMap<>();
        paymentRepository.findByPaymentStatus("paid").forEach(p -> {
            if (p.getPaymentDate() == null) return;
            String key = p.getPaymentDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                    + " " + p.getPaymentDate().getYear();
            totals.merge(key, p.getAmount(), BigDecimal::add);
        });
        return totals.entrySet().stream()
                .map(e -> Map.of("month", e.getKey(), "total", e.getValue()))
                .toList();
    }
}
