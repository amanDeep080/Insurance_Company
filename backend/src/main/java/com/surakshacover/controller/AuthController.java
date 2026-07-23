package com.surakshacover.controller;

import com.surakshacover.dto.*;
import com.surakshacover.entity.User;
import com.surakshacover.security.AuthenticatedUser;
import com.surakshacover.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    @PostMapping("/signup/start")
    public ResponseEntity<Map<String, Object>> signupStart(@Valid @RequestBody RegisterRequest request) {
        authService.selfRegisterStart(request);
        return ResponseEntity.ok(Map.of("message", "OTP sent for registration."));
    }

    @PostMapping("/signup/verify")
    public ResponseEntity<Map<String, Object>> signupVerify(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.selfRegisterVerify(request, request.getCode()));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(authService.getStatus(user.id()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> listPending() {
        return ResponseEntity.ok(authService.getPendingUsers());
    }

    @PostMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> approve(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser admin) {
        authService.approveUser(id, admin.id());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reject(@PathVariable Long id, @RequestBody Map<String, String> body, @AuthenticationPrincipal AuthenticatedUser admin) {
        authService.rejectUser(id, body.get("reason"), admin.id());
        return ResponseEntity.ok().build();
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
