package com.emberleaf.dto;

public class ProductDTO {
    private Long id;
    private String name;
    private String category;
    private String description;
    private String fullDescription;
    private String priceDisplay;
    private String origin;
    private String strength;
    private String caffeine;
    private String bestTime;
    private String iconUnicode;
    private Integer stockQuantity;
    private String imageUrl;
    private String logoUrl;

    public ProductDTO() {}

    public ProductDTO(Long id, String name, String category, String description,
                      String fullDescription, String priceDisplay, String origin,
                      String strength, String caffeine, String bestTime, String iconUnicode,
                      Integer stockQuantity, String imageUrl, String logoUrl) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.fullDescription = fullDescription;
        this.priceDisplay = priceDisplay;
        this.origin = origin;
        this.strength = strength;
        this.caffeine = caffeine;
        this.bestTime = bestTime;
        this.iconUnicode = iconUnicode;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.logoUrl = logoUrl;
    }

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
    public String getPriceDisplay() { return priceDisplay; }
    public void setPriceDisplay(String priceDisplay) { this.priceDisplay = priceDisplay; }
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