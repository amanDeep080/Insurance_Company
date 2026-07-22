package com.surakshacover.service;

import com.surakshacover.dto.*;
import com.surakshacover.entity.User;
import com.surakshacover.exception.ApiException;
import com.surakshacover.repository.UserRepository;
import com.surakshacover.security.JwtService;
import com.surakshacover.util.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

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
                .build();
        User saved = userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Account created. Please log in.");
        result.put("userId", saved.getId());
        return result;
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

        String token = jwtService.generateToken(user.getId(), user.getRole(), user.getName(), user.getEmail());

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Logged in.");
        result.put("token", token);
        result.put("user", Map.of(
                "id", user.getId(), "name", user.getName(), "email", user.getEmail(), "role", user.getRole()));
        return result;
    }
}
