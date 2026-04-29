package com.chaiandleaf.service;

import com.chaiandleaf.dto.ProductDTO;
import com.chaiandleaf.entity.Product;
import com.chaiandleaf.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/*
 * PURPOSE: Business logic layer for Products.
 *
 * Maps Product entities to ProductDTOs — transforming price in paisa (internal)
 * to "₹349.00" formatted string (API response).
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductDTO> getAll() {
        return productRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toDTO(product);
    }

    public List<ProductDTO> getByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO create(ProductDTO dto) {
        Product product = toEntity(dto);
        Product saved = productRepository.save(product);
        return toDTO(saved);
    }

    public ProductDTO update(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getCategory() != null) product.setCategory(dto.getCategory());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getFullDescription() != null) product.setFullDescription(dto.getFullDescription());
        if (dto.getOrigin() != null) product.setOrigin(dto.getOrigin());
        if (dto.getStrength() != null) product.setStrength(dto.getStrength());
        if (dto.getCaffeine() != null) product.setCaffeine(dto.getCaffeine());
        if (dto.getBestTime() != null) product.setBestTime(dto.getBestTime());
        if (dto.getIconUnicode() != null) product.setIconUnicode(dto.getIconUnicode());
        if (dto.getStockQuantity() != null) product.setStockQuantity(dto.getStockQuantity());
        if (dto.getImageUrl() != null) product.setImageUrl(dto.getImageUrl());
        if (dto.getLogoUrl() != null) product.setLogoUrl(dto.getLogoUrl());
        if (dto.getPriceDisplay() != null) {
            String priceStr = dto.getPriceDisplay().replace("₹", "").replace(",", "");
            product.setPrice((int) Math.round(Double.parseDouble(priceStr) * 100));
        }
        Product saved = productRepository.save(product);
        return toDTO(saved);
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    private ProductDTO toDTO(Product p) {
        return new ProductDTO(
                p.getId(),
                p.getName(),
                p.getCategory(),
                p.getDescription(),
                p.getFullDescription(),
                String.format("₹%.2f", p.getPrice() / 100.0),
                p.getOrigin(),
                p.getStrength(),
                p.getCaffeine(),
                p.getBestTime(),
                p.getIconUnicode(),
                p.getStockQuantity() != null ? p.getStockQuantity() : 0,
                p.getImageUrl(),
                p.getLogoUrl()
        );
    }

    private Product toEntity(ProductDTO dto) {
        Product p = new Product();
        p.setName(dto.getName());
        p.setCategory(dto.getCategory());
        p.setDescription(dto.getDescription());
        p.setFullDescription(dto.getFullDescription());
        String priceStr = dto.getPriceDisplay().replace("₹", "").replace(",", "");
        p.setPrice((int) Math.round(Double.parseDouble(priceStr) * 100));
        p.setOrigin(dto.getOrigin());
        p.setStrength(dto.getStrength());
        p.setCaffeine(dto.getCaffeine());
        p.setBestTime(dto.getBestTime());
        p.setIconUnicode(dto.getIconUnicode());
        p.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0);
        p.setImageUrl(dto.getImageUrl());
        p.setLogoUrl(dto.getLogoUrl());
        return p;
    }
}
