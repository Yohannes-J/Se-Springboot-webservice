package org.wldu.webservices.services.contracts;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.wldu.webservices.entities.Customer;
import org.wldu.webservices.exception.BadRequestException;
import org.wldu.webservices.exception.ResourceNotFoundException;
import org.wldu.webservices.repositories.CustomerRepository;


import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    /* =======================
       ADD CUSTOMER
       ======================= */
    public Customer addCustomer(Customer customer) {

        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new BadRequestException(
                    "Email already exists"
            );
        }

        if (customerRepository.existsByPhoneNumber(customer.getPhoneNumber())) {
            throw new BadRequestException(
                    "Phone number already exists"
            );
        }

        if (customer.getRole() == null) {
            customer.setRole("STUDENT");
        }

        return customerRepository.save(customer);
    }

    /* =======================
       GET ALL
       ======================= */
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    /* =======================
       GET BY ID
       ======================= */
    public Customer getCustmer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found with id " + id
                        )
                );
    }

    /* =======================
       UPDATE CUSTOMER
       ======================= */
    public Customer updateCustmer(Long id, Customer updatedCustomer) {

        return customerRepository.findById(id)
                .map(customer -> {

                    customer.setName(updatedCustomer.getName());
                    customer.setRole(updatedCustomer.getRole());

                    // Email validation
                    if (!customer.getEmail().equals(updatedCustomer.getEmail())) {
                        if (customerRepository.existsByEmail(updatedCustomer.getEmail())) {
                            throw new BadRequestException(
                                    "Email already exists"
                            );
                        }
                        customer.setEmail(updatedCustomer.getEmail());
                    }

                    // Phone validation
                    if (!customer.getPhoneNumber().equals(updatedCustomer.getPhoneNumber())) {
                        if (customerRepository.existsByPhoneNumber(updatedCustomer.getPhoneNumber())) {
                            throw new BadRequestException(
                                    "Phone number already exists"
                            );
                        }
                        customer.setPhoneNumber(updatedCustomer.getPhoneNumber());
                    }

                    return customerRepository.save(customer);
                })
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found with id " + id
                        )
                );
    }

    /* =======================
       DELETE CUSTOMER
       ======================= */
    public void deleteCustomer(Long id) {

        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Customer not found with id " + id
            );
        }

        customerRepository.deleteById(id);
    }

    /* =======================
       SEARCH
       ======================= */
    public List<Customer> searchByName(String name) {
        return customerRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Customer> searchByEmail(String email) {
        return customerRepository.findByEmailContainingIgnoreCase(email);
    }

    /* =======================
       PAGINATION
       ======================= */
    public Page<Customer> getCustomers(
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {

        if (page < 0 || size <= 0) {
            throw new BadRequestException(
                    "Page index must be >= 0 and size must be > 0"
            );
        }

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        if (search != null && !search.isEmpty()) {
            return customerRepository.findByNameContainingIgnoreCase(search, pageable);
        }

        return customerRepository.findAll(pageable);
    }
}
