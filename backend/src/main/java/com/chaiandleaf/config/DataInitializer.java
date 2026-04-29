package com.chaiandleaf.config;

import com.chaiandleaf.entity.Product;
import com.chaiandleaf.entity.Role;
import com.chaiandleaf.entity.User;
import com.chaiandleaf.repository.ProductRepository;
import com.chaiandleaf.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/*
 * PURPOSE: Seeds the H2 database with 9 Indian tea products on startup.
 *
 * CommandLineRunner runs after the application context is fully loaded.
 * The count() check prevents duplicate seeding on restart.
 * Prices are stored in paisa (e.g., ₹349.00 = 34900) to avoid floating-point errors.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(ProductRepository productRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedProducts();
    }

    private void seedAdminUser() {
        if (userRepository.findByEmail("admin@chaiandleaf.com").isPresent()) {
            return;
        }
        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin@chaiandleaf.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        admin.setCreatedAt(java.time.LocalDateTime.now());
        admin.setEmailVerified(true);
        userRepository.save(admin);
    }

    private void seedProducts() {
        if (productRepository.count() > 0) {
            return;
        }

        productRepository.save(new Product(null,
                "Nilgiri Frost", "black",
                "A smooth and aromatic black tea from the misty hills of Nilgiri.",
                "Grown at 2,000 metres in the Western Ghats, Nilgiri Frost is celebrated for its fragrant, full-bodied character. The golden liquor carries notes of malt and dark fruit, with a clean, brisk finish — perfect any time of day.",
                34900, "Nilgiris, Tamil Nadu", "Medium — 6/10", "Moderate", "Morning or afternoon", "🍂", 20, null, null));

        productRepository.save(new Product(null,
                "Green Darjeeling", "green",
                "A light, floral green tea from the foothills of the Himalayas.",
                "First-flush Darjeeling green tea, hand-rolled and gently withered on the slopes of Happy Valley Estate. The pale liquor yields delicate floral notes with a hint of muscatel sweetness — distinctly Darjeeling.",
                44900, "Darjeeling, West Bengal", "Light — 3/10", "Moderate", "Afternoon", "🍃", 20, null, null));

        productRepository.save(new Product(null,
                "Moonlight Silver", "white",
                "Delicate white tea with subtle honey and floral notes.",
                "Moonlight Silver is crafted from the youngest buds, simply withered and sun-dried. The cup is pale and luminous with a honey-sweet character, hints of melon and fresh apricot, and a gentle floral aroma.",
                54900, "Kangra Valley, Himachal", "Very Light — 2/10", "Low", "Evening relaxation", "🌙", 20, null, null));

        productRepository.save(new Product(null,
                "Golden Assam", "black",
                "Rich, malty Assam black tea — the backbone of every classic chai.",
                "Sourced from second-flush estates in the Brahmaputra valley, Golden Assam is bold and full-bodied with the signature malty sweetness that defines authentic chai. Brew it strong with milk and sugar for a truly satisfying cup.",
                29900, "Assam", "Bold — 8/10", "High", "Morning, with milk", "🫖", 20, null, null));

        productRepository.save(new Product(null,
                "Jasmine Pearl", "green",
                "Hand-rolled green tea pearls scented with fresh jasmine blossoms.",
                "Each leaf is hand-rolled into a tight pearl and layered with fresh jasmine flowers over multiple nights. The pearls unfurl slowly in hot water, releasing a fragrant jasmine bouquet carried by the smooth green tea base.",
                49900, "Kashmir Valley", "Light — 4/10", "Low-Medium", "Afternoon or after meals", "🌸", 20, null, null));

        productRepository.save(new Product(null,
                "Munnar Mist", "herbal",
                "A soothing, caffeine-free herbal infusion from the Munnar high ranges.",
                "A calming herbal blend of locally sourced lemongrass, tulsi, mint, and a touch of ginger from the Munnar high ranges. Naturally caffeine-free, this soothing infusion is perfect for winding down after a long day.",
                37900, "Munnar, Kerala", "Soothing — 1/10", "None", "Evening or before sleep", "🌿", 20, null, null));

        productRepository.save(new Product(null,
                "Royal Masala Chai", "blend",
                "Our signature masala chai blend — cardamom, ginger, cinnamon, and clove.",
                "Royal Masala Chai is a carefully crafted blend of strong Assam black tea with freshly ground cardamom, ginger, cinnamon, clove, and black pepper. Aromatic, warming, and deeply satisfying — the quintessential Indian chai in every sip.",
                24900, "Assam & Kerala spices", "Medium-Strong — 6/10", "Moderate", "Any time of day", "☕", 20, null, null));

        productRepository.save(new Product(null,
                "First Flush Oolong", "oolong",
                "A delicate, semi-oxidised tea with the fragrance of spring blossoms.",
                "Hand-picked during the earliest spring flush from high-altitude Darjeeling gardens, this oolong is lightly oxidised to reveal a floral, aromatic cup with notes of apricot, honey, and wild spring flowers.",
                59900, "Darjeeling, West Bengal", "Medium — 5/10", "Medium", "Mid-morning or afternoon", "🍵", 20, null, null));

        productRepository.save(new Product(null,
                "Kashmiri Kahwa", "herbal",
                "Traditional Kashmiri green tea infused with saffron, almonds, and cinnamon.",
                "Kahwa is an age-old Kashmiri tradition — delicate green tea brewed with saffron strands, cinnamon bark, cardamom pods, and slivered almonds. Light, golden, and warmly spiced, it's the tea of celebration, conversation, and comfort.",
                39900, "Srinagar, Kashmir", "Gentle — 3/10", "Low", "After meals or gatherings", "🌺", 20, null, null));
    }
}
