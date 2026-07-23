package com.surakshacover.security;

public record AuthenticatedUser(Long id, String role, String name, String email, String status) {}
