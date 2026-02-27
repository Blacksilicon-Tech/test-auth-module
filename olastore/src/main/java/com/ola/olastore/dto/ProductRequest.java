package com.ola.olastore.dto;

import jakarta.validation.constraints.*;
import org.aspectj.bridge.Message;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Product name is required")
        @Size( min = 5, max = 50, message = "product name must be between 5 and 50 characters")
        String name,


        @NotBlank(message = "Product description must be required")
        @Size( min = 5, max = 50, message = "product name must be between 5 and 500 characters")
        String description,

        @NotNull
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        @Digits(integer = 10, fraction = 2, message = "Prcde must not be a valid momentary amount ")
        BigDecimal price,



        @Min(value = 0, message = "Popularity must be 0 or greater")
        @Min(value = 10, message = "Popularity must be 10 or less")
        int popularity
) {


}
