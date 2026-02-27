package com.ola.olastore.repository;

import com.ola.olastore.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    void deleteByPublicId(String publicId);
}
