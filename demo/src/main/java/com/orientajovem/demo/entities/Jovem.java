package com.orientajovem.demo.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import java.util.List;

@Entity
@Table(name = "TB_JOVEM")
public class Jovem {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ID")
	private int id;
	@Column(name = "NOME")
	private String nome;
	@Column(name = "LOGIN")
	private String login;
    @Column(name = "SENHA")
    private String senha;
	@Column(name = "CPF")
	private String cpf;
	@Column(name = "EMAIL")
	private String email;
	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ID_PROJETO")
	private Projeto projeto;
	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ID_TUTOR")
	private Tutor tutor;
	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ID_EMPRESA")
	private Empresa empresa;
	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "jovem")
	private List<Avaliacao> avaliacao;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getLogin() {
		return login;
	}

	public void setLogin(String login) {
		this.login = login;
	}

	public String getSenha() {
		return senha;
	}

	public void setSenha(String senha) {
		this.senha = senha;
	}

	public String getCpf() {
		return cpf;
	}

	public void setCpf(String cpf) {
		this.cpf = cpf;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	
	
}
