package org.wldu.webservices.repositories;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.wldu.webservices.entities.Book;


public interface BookRepository extends JpaRepository<Book,Long> {
    Page<Book> findByTitleContainingIgnoreCase(String name, Pageable pageable);

}
