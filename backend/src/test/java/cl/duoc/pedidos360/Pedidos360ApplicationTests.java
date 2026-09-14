package cl.duoc.pedidos360;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver"
})
class Pedidos360ApplicationTests {

    @Test
    void contextLoads() {
        // Verifica que el contexto de Spring Boot inicie correctamente
    }
}
