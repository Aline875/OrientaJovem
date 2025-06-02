package com.orientajovem.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import com.orientajovem.demo.entities.Empresa;
import com.orientajovem.demo.repositories.EmpresaRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class EmpresaService {
	
	@Autowired
	private EmpresaRepository empresaRepository;

	public Empresa incluir(Empresa empresa) {
        return empresaRepository.save(empresa);
	}
	
	public List<Empresa> listar(){
		return empresaRepository.findAll();
	}
	
	public Empresa buscarEmpresa(int id) {
		return empresaRepository.findById(id)
		        .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrado para o ID: " + id));
	}

}

