package com.surakshacover.service;

import com.surakshacover.dto.CustomerRequest;
import com.surakshacover.entity.Customer;
import com.surakshacover.entity.User;
import com.surakshacover.exception.ApiException;
import com.surakshacover.repository.CustomerRepository;
import com.surakshacover.repository.UserRepository;
import com.surakshacover.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Customer> list(String search) {
        if (search == null || search.isBlank()) {
            return customerRepository.findAll();
        }
        return customerRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCase(
                search, search, search);
    }

    public Customer get(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ApiException("Customer not found.", HttpStatus.NOT_FOUND));
    }

    public Customer create(CustomerRequest request, AuthenticatedUser actor) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ApiException("Name is required.", HttpStatus.BAD_REQUEST);
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ApiException("Email is required.", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("A user with this email already exists.", HttpStatus.CONFLICT);
        }

        // 1. Create the User account so they can log in
        String password = request.getPassword();
        if (password == null || password.isBlank()) {
            password = "Password@123"; // Default if not provided
        }

        User user = userRepository.save(User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(password))
                .role("customer")
                .phone(request.getPhone())
                .verified(true)
                .build());

        // 2. Create the Customer profile linked to that User
        Customer customer = Customer.builder()
                .userId(user.getId())
                .name(request.getName())
                .dob(request.getDob())
                .phone(request.getPhone())
                .address(request.getAddress())
                .email(request.getEmail())
                .createdBy(actor.id())
                .build();
        return customerRepository.save(customer);
    }

    public Customer update(Long id, CustomerRequest request) {
        Customer customer = get(id);
        if (request.getName() != null) customer.setName(request.getName());
        if (request.getDob() != null) customer.setDob(request.getDob());
        if (request.getPhone() != null) customer.setPhone(request.getPhone());
        if (request.getAddress() != null) customer.setAddress(request.getAddress());
        if (request.getEmail() != null) customer.setEmail(request.getEmail());
        return customerRepository.save(customer);
    }
}
