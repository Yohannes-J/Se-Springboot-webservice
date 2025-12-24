package org.wldu.webservices.services.contracts;

import org.springframework.stereotype.Service;
import org.wldu.webservices.entities.Customer;
import org.wldu.webservices.repositories.CustomerRepository;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // Add new customer
    public Customer addCustomer(Customer customer) {

        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (customerRepository.existsByPhoneNumber(customer.getPhoneNumber())) {
            throw new RuntimeException("Phone number already exists");
        }

        if (customer.getRole() == null) {
            customer.setRole("STUDENT");
        }

        return customerRepository.save(customer);
    }

    // Get all customers
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // Get customer by ID
    public Customer getCustmer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));
    }

    // Update customer
    public Customer updateCustmer(Long id, Customer updatedCustomer) {

        return customerRepository.findById(id).map(customer -> {

            customer.setName(updatedCustomer.getName());
            customer.setRole(updatedCustomer.getRole());

            // Email check
            if (!customer.getEmail().equals(updatedCustomer.getEmail())) {
                if (customerRepository.existsByEmail(updatedCustomer.getEmail())) {
                    throw new RuntimeException("Email already exists");
                }
                customer.setEmail(updatedCustomer.getEmail());
            }

            // Phone number check
            if (!customer.getPhoneNumber().equals(updatedCustomer.getPhoneNumber())) {
                if (customerRepository.existsByPhoneNumber(updatedCustomer.getPhoneNumber())) {
                    throw new RuntimeException("Phone number already exists");
                }
                customer.setPhoneNumber(updatedCustomer.getPhoneNumber());
            }

            return customerRepository.save(customer);

        }).orElseThrow(() -> new RuntimeException("Customer not found with id " + id));
    }

    // Delete customer
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found with id " + id);
        }
        customerRepository.deleteById(id);
    }

    // Search by name
    public List<Customer> searchByName(String name) {
        return customerRepository.findByNameContainingIgnoreCase(name);
    }

    // Search by email
    public List<Customer> searchByEmail(String email) {
        return customerRepository.findByEmailContainingIgnoreCase(email);
    }
}
