package com.ola.olastore.service;

import com.ola.olastore.dto.ProductDto;
import com.ola.olastore.dto.ProductRequest;

import java.util.List;

public interface IProductService {

    ProductDto createProduct (ProductRequest productRequest);

    List<ProductDto> getAllProducts();

    ProductDto getProductById(Long productId);

    ProductDto updateProduct(Long productId, ProductRequest productRequest);

    String deleteProduct(Long productId);

}
