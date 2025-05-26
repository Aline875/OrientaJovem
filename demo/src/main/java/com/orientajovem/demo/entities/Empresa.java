package com.orientajovem.demo.entities;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "TB_EMPRESA")
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;
    @Column(name = "NOME")
    private String nome;
    @Column(name = "CNPJ")
    private String cpf;
    @Column(name = "EMAIL")
    private String email;
    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "empresa")
    private List<Tutor> tutor;
    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "empresa")
    private List<Projeto> projeto;
    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "empresa")
    private List<Jovem> jovem;

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

    public List<Tutor> getTutor() {
        return tutor;
    }

    public void setTutor(List<Tutor> tutor) {
        this.tutor = tutor;
    }

    public List<Projeto> getProjeto() {
        return projeto;
    }

    public void setProjeto(List<Projeto> projeto) {
        this.projeto = projeto;
    }

    public List<Jovem> getJovem() {
        return jovem;
    }

    public void setJovem(List<Jovem> jovem) {
        this.jovem = jovem;
    }
}
