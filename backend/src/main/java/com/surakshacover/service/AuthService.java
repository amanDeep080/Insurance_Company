package com.surakshacover.service;

import com.surakshacover.dto.*;
import com.surakshacover.entity.User;
import com.surakshacover.exception.ApiException;
import com.surakshacover.repository.UserRepository;
import com.surakshacover.security.JwtService;
import com.surakshacover.util.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final JwtService jwtService;

    public Map<String, Object> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("An account with this email already exists.", HttpStatus.CONFLICT);
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("customer")
                .phone(request.getPhone())
                .status("ACTIVE")
                .verified(true)
                .build();
        User saved = userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Account created. Please log in.");
        result.put("userId", saved.getId());
        return result;
    }

    public void selfRegisterStart(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            User existing = userRepository.findByEmail(request.getEmail()).get();
            if ("PENDING".equals(existing.getStatus())) {
                throw new ApiException("Your application is already pending review.", HttpStatus.CONFLICT);
            }
            throw new ApiException("An account with this email already exists.", HttpStatus.CONFLICT);
        }
        otpService.sendToEmail(request.getEmail(), "registration");
    }

    public Map<String, Object> selfRegisterVerify(RegisterRequest request, String code) {
        boolean valid = otpService.verifyByEmail(request.getEmail(), code, "registration");
        if (!valid) throw new ApiException("Invalid or expired OTP.", HttpStatus.UNAUTHORIZED);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : "customer")
                .phone(request.getPhone())
                .status("PENDING")
                .verified(true)
                .build();
        User saved = userRepository.save(user);

        String token = jwtService.generateToken(saved.getId(), saved.getRole(), saved.getName(), saved.getEmail(), saved.getStatus());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", Map.of("id", saved.getId(), "name", saved.getName(), "role", saved.getRole(), "status", saved.getStatus()));
        return result;
    }

    public Map<String, Object> getStatus(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Map<String, Object> res = new HashMap<>();
        res.put("id", user.getId());
        res.put("status", user.getStatus());
        res.put("name", user.getName());
        res.put("email", user.getEmail());
        res.put("phone", user.getPhone());
        res.put("role", user.getRole());
        res.put("createdAt", user.getCreatedAt());
        res.put("rejectionReason", user.getRejectionReason());
        return res;
    }

    public List<User> getPendingUsers() {
        return userRepository.findByStatus("PENDING");
    }

    public void approveUser(Long userId, Long adminId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setStatus("ACTIVE");
        user.setReviewedBy(adminId);
        user.setReviewedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        log.info("[NOTIFY] User {} has been APPROVED", user.getEmail());
    }

    public void rejectUser(Long userId, String reason, Long adminId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setStatus("REJECTED");
        user.setRejectionReason(reason);
        user.setReviewedBy(adminId);
        user.setReviewedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        log.info("[NOTIFY] User {} has been REJECTED for: {}", user.getEmail(), reason);
    }

    public Long loginStart(LoginStartRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password.", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid email or password.", HttpStatus.UNAUTHORIZED);
        }

        otpService.createAndSend(user.getId(), "email", "login");
        otpService.createAndSend(user.getId(), "sms", "login");

        return user.getId();
    }

    public Map<String, Object> loginVerify(LoginVerifyRequest request) {
        boolean valid = otpService.verify(request.getUserId(), request.getCode(), "login");
        if (!valid) {
            throw new ApiException("Invalid or expired OTP.", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ApiException("User not found.", HttpStatus.NOT_FOUND));

        String token = jwtService.generateToken(user.getId(), user.getRole(), user.getName(), user.getEmail(), user.getStatus());

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Logged in.");
        result.put("token", token);
        result.put("user", Map.of(
                "id", user.getId(), "name", user.getName(), "email", user.getEmail(), "role", user.getRole(), "status", user.getStatus()));
        return result;
    }
}
