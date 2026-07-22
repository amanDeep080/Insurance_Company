package com.surakshacover.repository;

import com.surakshacover.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByStatus(String status);
    List<Policy> findByCustomerId(Long customerId);
    List<Policy> findByStatusAndCustomerId(String status, Long customerId);
    long countByStatus(String status);
}
