package com.surakshacover.repository;

import com.surakshacover.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByStatus(String status);
    List<Claim> findByPolicyId(Long policyId);
    List<Claim> findByPolicyIdIn(List<Long> policyIds);
    long countByStatus(String status);
}
