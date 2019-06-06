package com.example.ecommerce.repositories;

import org.springframework.data.repository.PagingAndSortingRepository;

import com.example.ecommerce.model.Item;

public interface ItemRepository extends PagingAndSortingRepository<Item, Long> {

}
