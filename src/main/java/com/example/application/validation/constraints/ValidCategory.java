package com.example.application.validation.constraints;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

import com.example.application.validation.CategoryValidator;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy=CategoryValidator.class)
public @interface ValidCategory {
	String message() default "Invalid category";
	Class<?>[] groups() default {};
	Class<? extends Payload>[] payload() default {};
}