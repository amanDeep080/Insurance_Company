package com.surakshacover.controller;

import com.surakshacover.entity.Document;
import com.surakshacover.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<Document>> list(@RequestParam(required = false) Long customerId,
                                                @RequestParam(required = false) Long claimId) {
        return ResponseEntity.ok(documentService.list(customerId, claimId));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Document> upload(@RequestParam("file") MultipartFile file,
                                            @RequestParam(required = false) Long customerId,
                                            @RequestParam(required = false) Long claimId,
                                            @RequestParam(required = false) String docType) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.upload(file, customerId, claimId, docType));
    }
}
