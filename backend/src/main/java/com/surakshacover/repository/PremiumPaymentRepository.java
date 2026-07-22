package com.surakshacover.repository;

import com.surakshacover.entity.PremiumPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PremiumPaymentRepository extends JpaRepository<PremiumPayment, Long> {
    List<PremiumPayment> findByPolicyId(Long policyId);
    List<PremiumPayment> findByPaymentStatus(String status);
    List<PremiumPayment> findByPolicyIdIn(List<Long> policyIds);
}
