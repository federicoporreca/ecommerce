package com.example.ecommerce.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.ecommerce.repositories.CategoryRepository;

@Controller
public class ConsoleController {
	
	@Autowired
	CategoryRepository categoryRepository;

	@GetMapping("/console")
	public String showConsole(Model model) {
		model.addAttribute("categories", categoryRepository.findByParentIsNull());
		return "console";
	}
	
}
