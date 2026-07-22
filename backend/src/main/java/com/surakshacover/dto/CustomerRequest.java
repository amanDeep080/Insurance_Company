package com.surakshacover.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CustomerRequest {
    private String name;
    private LocalDate dob;
    private String phone;
    private String address;
    private String email;
    private String password;
}
