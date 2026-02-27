package com.ola.olastore.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ContactRequestDto(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,


        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        String email,

        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^[0-9]{10,15}$",message = "Mobile number must be between 10 and 15 digits")
        String mobileNumber,

        @NotBlank(message = "Message is required")
        @Size(max= 500, message = "Message must not exceed 500 characters")
        String message
) {




}
