package com.ola.olastore.service.impl;

import com.ola.olastore.dto.ProductDto;
import com.ola.olastore.dto.ProductRequest;
import com.ola.olastore.entity.Product;
import com.ola.olastore.exception.ProductAlreadyexistException;
import com.ola.olastore.repository.ProductRepository;
import com.ola.olastore.service.IProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class ProductServiceImel implements IProductService {

    private final ProductRepository productRepository;

    @Override
    public ProductDto createProduct(ProductRequest productRequest) {

        if (productRepository.findByName(productRequest.name()).isPresent()) {
            throw new ProductAlreadyexistException("Product with name' " + productRequest.name() +
                    "already exists");
        }
        Product product = mapToProductEntity(productRequest);
        Product savedProduct = productRepository.save(product);
        return mapToProductEntityToDto(savedProduct);
    }

    @Override
    public List<ProductDto> getAllProducts() {
        List<ProductDto> productDtoList = productRepository.findAll().stream().map(this::mapToProductEntityToDto)
                .collect(Collectors.toList());
        return productDtoList;
    }

    @Override
    public ProductDto getProductById( Long productId) {
        Product product = productRepository.findById(productId).orElseThrow(
                () -> new IllegalArgumentException("Product not found"));
        return mapToProductEntityToDto(product);
    }

    @Override
    public ProductDto updateProduct(Long productId, ProductRequest productRequest) {
        Product product = productRepository.findById(productId).
                orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(productRequest.name());
        product.setDescription(productRequest.description());
        product.setPrice(productRequest.price());
        product.setPopularity(productRequest.popularity());
        return mapToProductEntityToDto(productRepository.save(product));
    }

    @Override
    public String deleteProduct(Long productId) {
        Product product = productRepository.findById(productId).
                orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
        return "product has been deleted";
    }


    private Product mapToProductEntity (ProductRequest productRequest){
        Product product = new Product();
        product.setName(productRequest.name());
        product.setDescription(productRequest.description());
        product.setPrice(productRequest.price());
        product.setPopularity(productRequest.popularity());
        return product;


    }
        private ProductDto mapToProductEntityToDto (Product product){

        ProductDto productDto= new ProductDto();
        productDto.setProductId(product.getProductId());
        productDto.setName(product.getName());
        productDto.setDescription(product.getDescription());
        productDto.setPrice(product.getPrice());
        productDto.setPopularity(product.getPopularity());
        return productDto;

        }
}
