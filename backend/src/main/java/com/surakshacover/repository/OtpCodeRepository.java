package com.surakshacover.repository;

import com.surakshacover.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findFirstByUserIdAndCodeAndPurposeAndConsumedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            Long userId, String code, String purpose, LocalDateTime now);
}
