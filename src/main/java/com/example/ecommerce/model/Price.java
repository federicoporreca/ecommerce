package com.example.ecommerce.model;

import java.math.BigDecimal;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;

@Entity
public class Price {
	
	public enum Currency {
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

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public BigDecimal getValue() {
		return value;
	}

	public void setValue(BigDecimal value) {
		this.value = value;
	}

	public Currency getCurrency() {
		return currency;
	}

	public void setCurrency(Currency currency) {
		this.currency = currency;
	}
	
}
