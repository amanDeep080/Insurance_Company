package com.surakshacover.util;

import com.surakshacover.entity.OtpCode;
import com.surakshacover.entity.User;
import com.surakshacover.repository.OtpCodeRepository;
import com.surakshacover.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final SecureRandom random = new SecureRandom();

    @Value("${app.brevo.api-key}")
    private String brevoApiKey;

    @Value("${app.twofactor.api-key}")
    private String twoFactorApiKey;

    public OtpService(OtpCodeRepository otpCodeRepository, UserRepository userRepository, RestTemplate restTemplate) {
        this.otpCodeRepository = otpCodeRepository;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    public void createAndSend(Long userId, String channel, String purpose) {
        String code = String.valueOf(100000 + random.nextInt(900000));

        OtpCode otp = OtpCode.builder()
                .userId(userId)
                .channel(channel)
                .code(code)
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        otpCodeRepository.save(otp);

        deliver(userId, channel, code);
    }

    private void deliver(Long userId, String channel, String code) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User {} not found, cannot deliver OTP", userId);
            return;
        }

        if ("email".equals(channel)) {
            String email = user.getEmail();
            log.info(">>>> [OTP] Email code for {}: {}", email, code);

            if (brevoApiKey == null || brevoApiKey.isBlank()) {
                log.warn("Brevo API key not set, skipping email delivery.");
                return;
            }

            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("api-key", brevoApiKey);

                Map<String, Object> sender = new HashMap<>();
                sender.put("name", "Suraksha Cover");
                sender.put("email", "amandeepkumar0806@gmail.com"); // Must be your Brevo sender email

                Map<String, Object> receiver = new HashMap<>();
                receiver.put("email", email);

                Map<String, Object> body = new HashMap<>();
                body.put("sender", sender);
                body.put("to", List.of(receiver));
                body.put("subject", "Your Verification Code - Suraksha Cover");
                body.put("htmlContent", "<html><body><p>Hello,</p><p>Your verification code is: <strong>" + code + "</strong></p><p>This code expires in 10 minutes.</p></body></html>");

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                restTemplate.postForEntity("https://api.brevo.com/v3/smtp/email", request, String.class);
                log.info("Email successfully sent via Brevo to {}", email);
            } catch (Exception e) {
                log.error("Brevo API Error: {}", e.getMessage());
            }

        } else if ("sms".equals(channel)) {
            String phone = user.getPhone();
            log.info(">>>> [OTP] SMS code for {}: {}", phone, code);

            if (twoFactorApiKey == null || twoFactorApiKey.isBlank() || phone == null || phone.isBlank()) {
                return;
            }

            try {
                String url = String.format("https://2factor.in/API/V1/%s/SMS/%s/%s", twoFactorApiKey, phone, code);
                restTemplate.getForEntity(url, String.class);
                log.info("SMS successfully sent via 2Factor.in to {}", phone);
            } catch (Exception e) {
                log.error("2Factor.in API Error: {}", e.getMessage());
            }
        }
    }

    public boolean verify(Long userId, String code, String purpose) {
        return otpCodeRepository
                .findFirstByUserIdAndCodeAndPurposeAndConsumedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                        userId, code, purpose, LocalDateTime.now())
                .map(otp -> {
                    otp.setConsumed(true);
                    otpCodeRepository.save(otp);
                    return true;
                })
                .orElse(false);
    }
}
