package com.example.application.repositories;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.example.application.model.Brand;

public interface BrandRepository extends CrudRepository<Brand, Long> {

	List<Brand> findByName(String name);
	
}
