package com.example.ecommerce.repositories;

import org.springframework.data.repository.CrudRepository;

import com.example.ecommerce.model.Price;

public interface PriceRepository extends CrudRepository<Price, Long> {

}
