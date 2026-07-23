package com.surakshacover.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class StatusCheckFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        var auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.getPrincipal() instanceof AuthenticatedUser user) {
            String path = request.getRequestURI();
            String contextPath = request.getContextPath();
            String relativePath = path.substring(contextPath.length());

            // Allow status and profile endpoints regardless of status
            boolean isAllowed = relativePath.startsWith("/auth/status") 
                             || relativePath.startsWith("/auth/me")
                             || relativePath.startsWith("/health");

            if (!isAllowed && !"ACTIVE".equals(user.status())) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\": \"Your account is " + user.status() + ". Access restricted.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
