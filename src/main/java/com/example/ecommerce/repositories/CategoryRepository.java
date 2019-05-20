package com.example.ecommerce.repositories;

import org.springframework.data.repository.CrudRepository;

import com.example.ecommerce.model.Category;

public interface CategoryRepository extends CrudRepository<Category, Long> {

	Iterable<Category> findByParentIsNull();

}
