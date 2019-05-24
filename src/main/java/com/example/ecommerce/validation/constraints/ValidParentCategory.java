package com.example.ecommerce.validation.constraints;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

import com.example.ecommerce.validation.ParentCategoryValidator;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy=ParentCategoryValidator.class)
public @interface ValidParentCategory {
	String message() default "Invalid parent category";
	Class<?>[] groups() default {};
	Class<? extends Payload>[] payload() default {};
}
