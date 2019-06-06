package com.example.ecommerce.model;

import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.PrePersist;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;
import javax.validation.constraints.Pattern;

import com.example.ecommerce.validation.constraints.ValidCategory;

import lombok.Data;

@Data
@Entity
public class Item {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Null
	private Long id;

	@ManyToOne(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
	@NotNull
	@Valid
	private Brand brand;

	@NotBlank
	private String name;

	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "item_id")
	@NotEmpty
	@Valid
	private List<Price> prices;

	@NotNull
	@Pattern(regexp = "\\d{13}")
	private String ean;

	@NotNull // TODO replace with pattern or custom constraint
	private String imageUrl;

	@ManyToOne
	@ValidCategory
	private Category category;
	
	private Date createdAt;
	
	@PrePersist
	public void createdAt() {
		this.createdAt = new Date();
	}

}
