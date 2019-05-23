package com.example.ecommerce.controllers.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce.model.Price.Currency;

@RestController
@RequestMapping("/currencies")
public class CurrencyController {

	@GetMapping
	public Currency[] getCurrencies() {
		return Currency.values();
	}
	
}
