package com.orientajovem.demo.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "TB_AVALIACAO")
public class Avaliacao {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ID")
	private int id;
	@Column(name = "FEEDBACK")
	private String feedback;
	@Column(name = "HABILIDADE")
	private String habilidade;
	@Column(name = "PONTUACAO")
	private float pontuacao;
	
}
