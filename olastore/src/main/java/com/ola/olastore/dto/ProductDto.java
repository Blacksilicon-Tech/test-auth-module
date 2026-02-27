package com.ola.olastore.dto;


import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class ProductDto {

    private Long productId;


    private String name;


    private String description;


    private BigDecimal price;



    private int popularity;


}
