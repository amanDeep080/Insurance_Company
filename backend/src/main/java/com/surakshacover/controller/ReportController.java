package com.surakshacover.controller;

import com.surakshacover.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    public ResponseEntity<?> summary() {
        return ResponseEntity.ok(reportService.dashboardSummary());
    }

    @GetMapping("/premiums/monthly")
    public ResponseEntity<?> monthlyPremiums() {
        return ResponseEntity.ok(reportService.monthlyPremiums());
    }
}
