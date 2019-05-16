package com.example.ecommerce.repositories;

import org.springframework.data.repository.CrudRepository;

import com.example.ecommerce.model.Item;

public interface ItemRepository extends CrudRepository<Item, Long> {

}
