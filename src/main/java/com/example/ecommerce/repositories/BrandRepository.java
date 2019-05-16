package com.example.ecommerce.repositories;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.example.ecommerce.model.Brand;

public interface BrandRepository extends CrudRepository<Brand, Long> {

	List<Brand> findByName(String name);
	
}
