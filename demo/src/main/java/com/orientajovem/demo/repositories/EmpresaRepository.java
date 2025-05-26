package com.orientajovem.demo.repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.orientajovem.demo.entities.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, Integer>{

	Optional<Empresa> findById(Integer id);

}
