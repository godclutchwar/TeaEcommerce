package com.emberleaf.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, length = 2000)
    private String fullDescription;

    @Column(nullable = false)
    private Integer price; // in cents

    @Column(nullable = false)
    private String origin;

    @Column(nullable = false)
    private String strength;

    @Column(nullable = false)
    private String caffeine;

    @Column(nullable = false)
    private String bestTime;

    @Column(nullable = false)
    private String iconUnicode;

    @Column
    private Integer stockQuantity;

    @Column(length = 2000)
    private String imageUrl;

    @Column(length = 2000)
    private String logoUrl;

    public Product() {}

    public Product(Long id, String name, String category, String description,
                   String fullDescription, Integer price, String origin,
                   String strength, String caffeine, String bestTime, String iconUnicode) {
        this(id, name, category, description, fullDescription, price, origin,
                strength, caffeine, bestTime, iconUnicode, 0, null, null);
    }

    public Product(Long id, String name, String category, String description,
                   String fullDescription, Integer price, String origin,
                   String strength, String caffeine, String bestTime, String iconUnicode,
                   Integer stockQuantity, String imageUrl, String logoUrl) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.fullDescription = fullDescription;
        this.price = price;
        this.origin = origin;
        this.strength = strength;
        this.caffeine = caffeine;
        this.bestTime = bestTime;
        this.iconUnicode = iconUnicode;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.logoUrl = logoUrl;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFullDescription() { return fullDescription; }
    public void setFullDescription(String fullDescription) { this.fullDescription = fullDescription; }
    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getStrength() { return strength; }
    public void setStrength(String strength) { this.strength = strength; }
    public String getCaffeine() { return caffeine; }
    public void setCaffeine(String caffeine) { this.caffeine = caffeine; }
    public String getBestTime() { return bestTime; }
    public void setBestTime(String bestTime) { this.bestTime = bestTime; }
    public String getIconUnicode() { return iconUnicode; }
    public void setIconUnicode(String iconUnicode) { this.iconUnicode = iconUnicode; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
}
