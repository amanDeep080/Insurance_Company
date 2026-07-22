package com.surakshacover.repository;

import com.surakshacover.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCustomerId(Long customerId);
    List<Document> findByClaimId(Long claimId);
}
