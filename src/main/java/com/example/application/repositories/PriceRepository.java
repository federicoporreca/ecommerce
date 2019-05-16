package com.example.application.repositories;

import org.springframework.data.repository.CrudRepository;

import com.example.application.model.Price;

public interface PriceRepository extends CrudRepository<Price, Long> {

}
