package com.orientajovem.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import com.orientajovem.demo.entities.Avaliacao;
import com.orientajovem.demo.repositories.AvaliacaoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AvaliacaoService {
	
	@Autowired
	private AvaliacaoRepository avaliacaoRepository;
	
    @Autowired
    private BCryptPasswordEncoder encoder;

	public Avaliacao incluir(Avaliacao avaliacao) {
        return avaliacaoRepository.save(avaliacao);
	}
	
	public List<Avaliacao> listar(){
		return avaliacaoRepository.findAll();
	}
	
	public Avaliacao buscarAvaliacao(int id) {
		return avaliacaoRepository.findById(id)
		        .orElseThrow(() -> new EntityNotFoundException("Avaliação não encontrado para o ID: " + id));
	}

}

