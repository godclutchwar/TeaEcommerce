package com.emberleaf.repository;

import com.emberleaf.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/*
 * PURPOSE: Data access for Product entities.
 *
 * WHAT SPRING DATA JPA DOES:
 * At compile time, Spring reads the method name `findByCategory`, understands it's a
 * query on the "category" column, and auto-generates: SELECT * FROM products WHERE category = ?
 * No raw SQL. No query builder. The method name IS the query.
 *
 * JpaRepository<Entity, Long> gives us: save(), findById(), findAll(), deleteById(), existsById(), count()
 * — all implemented automatically.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
}
