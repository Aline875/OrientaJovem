package com.orientajovem.demo.entities;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.OneToOne;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "TB_PROJETO")
public class Projeto {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ID")
	private int id;
	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "projeto")
	private List<Jovem> jovens;
	@Column(name = "NOME")
	private String nome;
	@Column(name = "DESCRICAO")
	private String descricao;
	@JsonIgnore
	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "projeto")
	private List<Avaliacao> avaliacao;
	@JsonIgnore
	@OneToOne(mappedBy = "tutor", fetch = FetchType.EAGER)
	private Tutor tutor;
	@JsonIgnore
	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "projeto")
	private List<Empresa> empresa;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public List<Jovem> getJovens() {
		return jovens;
	}

	public void setJovens(List<Jovem> jovens) {
		this.jovens = jovens;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public List<Avaliacao> getAvaliacao() {
		return avaliacao;
	}

	public void setAvaliacao(List<Avaliacao> avaliacao) {
		this.avaliacao = avaliacao;
	}

	public Tutor getTutor() {
		return tutor;
	}

	public void setTutor(Tutor tutor) {
		this.tutor = tutor;
	}

	public List<Empresa> getEmpresa() {
		return empresa;
	}

	public void setEmpresa(List<Empresa> empresa) {
		this.empresa = empresa;
	}
}
