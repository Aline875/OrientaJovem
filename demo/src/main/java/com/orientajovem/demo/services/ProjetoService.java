package com.orientajovem.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.orientajovem.demo.repositories.ProjetoRepository;
import com.orientajovem.demo.entities.Projeto;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ProjetoService {
	
	@Autowired
	private ProjetoRepository projetoRepository;

	@Autowired
    private BCryptPasswordEncoder encoder;

	public Projeto inserirProjeto(Projeto projeto) {
	    return projetoRepository.save(projeto);
	}
	
	public List<Projeto> listar(){
		return projetoRepository.findAll();
	}
	
	public Projeto buscarProjeto(int id) {
		return projetoRepository.findById(id)
		        .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado para o ID: " + id));
	}

}

