package com.example.application.validation;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import org.springframework.beans.factory.annotation.Autowired;

import com.example.application.model.Category;
import com.example.application.repositories.CategoryRepository;
import com.example.application.validation.constraints.ValidCategory;

public class CategoryValidator implements ConstraintValidator<ValidCategory, Category> {
	
	@Autowired
	CategoryRepository categoryRepository;

	@Override
	public boolean isValid(Category value, ConstraintValidatorContext context) {
		return value != null && value.getId() != null && categoryRepository.existsById(value.getId());
	}

}
