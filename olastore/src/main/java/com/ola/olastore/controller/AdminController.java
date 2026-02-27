package com.ola.olastore.controller;


import com.ola.olastore.CloudService.CloudinaryService;
import com.ola.olastore.dto.ProductImageResponse;
import com.ola.olastore.entity.Product;
import com.ola.olastore.entity.ProductImage;
import com.ola.olastore.repository.ProductImageRepository;
import com.ola.olastore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/adminn")
@RequiredArgsConstructor
public class AdminController {

    private final CloudinaryService cloudinaryService;
    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;

    @PostMapping("/{productId}/upload-image")
    public ResponseEntity<?> uploadProductImage(@PathVariable Long productId,
                                                @RequestParam("file")MultipartFile file) {
        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Map<String, Object> uploadResult = cloudinaryService.upload(file);
            String imageUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            ProductImage image = new ProductImage();
            image.setUrl(imageUrl);
            image.setPublicId(publicId);
            image.setProduct(product);

            product.getImages().add(image);
            productRepository.save(product);

return  ResponseEntity.ok(new ProductImageResponse(imageUrl, publicId));

        } catch (Exception e) {
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Image Upload Fail: " + e.getMessage());
        }
    }
    @DeleteMapping("/images/{publicId}")
    public ResponseEntity<?> deleteImage(@PathVariable String publicId) {
        try {
            cloudinaryService.delete(publicId);
            imageRepository.deleteByPublicId(publicId);
            return ResponseEntity.ok("Image deleted successfully");
        }catch (Exception e) {
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Image deletion failed: " + e.getMessage());
        }
    }
}
