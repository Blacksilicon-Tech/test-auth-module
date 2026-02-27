package com.ola.olastore.controller;

import com.ola.olastore.dto.ProductDto;
import com.ola.olastore.dto.ProductRequest;
import com.ola.olastore.service.IProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final IProductService productService;
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductRequest productRequest) {
        ProductDto productDto = productService.createProduct(productRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(productDto);
    }
    @GetMapping("/all")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        List<ProductDto> productDtoList = productService.getAllProducts();
        return ResponseEntity.status(HttpStatus.OK).body(productDtoList);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long productId) {
        ProductDto productDto  = productService.getProductById(productId);
        return ResponseEntity.status(HttpStatus.OK).body(productDto);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long productId,@RequestBody ProductRequest productRequest) {
        ProductDto productDto  = productService.updateProduct(productId, productRequest);
        return ResponseEntity.status(HttpStatus.OK).body(productDto);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long productId) {
      String message = productService.deleteProduct(productId);
        return ResponseEntity.status(HttpStatus.OK).body(message);
    }

}
