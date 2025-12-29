package org.wldu.webservices;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.wldu.webservices.config.FileStorageProperties;
@EnableConfigurationProperties(FileStorageProperties.class)
@SpringBootApplication

public class WebservicesApplication {



	public static void main(String[] args) {
		SpringApplication.run(WebservicesApplication.class, args);
	}

}
