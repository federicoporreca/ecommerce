package com.example.ecommerce.repositories;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.example.ecommerce.model.Category;

public interface CategoryRepository extends CrudRepository<Category, Long> {

	List<Category> findByParentIsNull();

}
