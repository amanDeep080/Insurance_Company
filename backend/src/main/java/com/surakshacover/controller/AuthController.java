package com.surakshacover.controller;

import com.surakshacover.dto.*;
import com.surakshacover.security.AuthenticatedUser;
import com.surakshacover.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginStart(@Valid @RequestBody LoginStartRequest request) {
        Long userId = authService.loginStart(request);
        return ResponseEntity.ok(Map.of("message", "OTP sent to your email and phone.", "userId", userId));
    }

    @PostMapping("/login/verify")
    public ResponseEntity<Map<String, Object>> loginVerify(@Valid @RequestBody LoginVerifyRequest request) {
        return ResponseEntity.ok(authService.loginVerify(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of("user", user));
    }
}
