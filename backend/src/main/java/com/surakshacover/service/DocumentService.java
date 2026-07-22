package com.surakshacover.service;

import com.surakshacover.entity.Document;
import com.surakshacover.exception.ApiException;
import com.surakshacover.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;

    @Value("${app.upload-dir}")
    private String uploadDir;

    public List<Document> list(Long customerId, Long claimId) {
        if (customerId != null) return documentRepository.findByCustomerId(customerId);
        if (claimId != null) return documentRepository.findByClaimId(claimId);
        return documentRepository.findAll();
    }

    public Document upload(MultipartFile file, Long customerId, Long claimId, String docType) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("No file uploaded.", HttpStatus.BAD_REQUEST);
        }
        try {
            Path dir = Path.of(uploadDir);
            Files.createDirectories(dir);

            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
            String storedName = UUID.randomUUID() + ext;
            Path target = dir.resolve(storedName);
            Files.copy(file.getInputStream(), target);

            Document document = Document.builder()
                    .customerId(customerId)
                    .claimId(claimId)
                    .docType(docType != null ? docType : "identity")
                    .fileName(original)
                    .filePath("/uploads/" + storedName)
                    .build();
            return documentRepository.save(document);
        } catch (IOException e) {
            throw new ApiException("Failed to save uploaded file.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
