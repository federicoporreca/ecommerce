package com.example.application.model;

import java.math.BigDecimal;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;

import lombok.Data;

@Data
@Entity
public class Price {
	
	private enum Currency {
		EUR, USD
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Null
	private Long id;
	
	@NotNull
	private BigDecimal value;
	
	@Enumerated(EnumType.STRING)
	@NotNull
	private Currency currency;
	
}
