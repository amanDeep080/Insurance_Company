package com.surakshacover.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginStartRequest {
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}
