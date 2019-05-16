package com.example.application.repositories;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.example.application.model.Category;

public interface CategoryRepository extends CrudRepository<Category, Long> {

	List<Category> findByParentIsNull();

}
