package com.orientajovem.demo.repositories;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.orientajovem.demo.entities.Jovem;


public interface JovemRepository extends JpaRepository<Jovem, Integer>{

	Optional<Jovem> findById(Integer id);

}


