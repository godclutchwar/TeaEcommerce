package com.emberleaf.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;

class GoogleTokenVerifierTest {

    private final GoogleTokenVerifier verifier = new GoogleTokenVerifier(new ObjectMapper());

    @Test
    void verify_invalidToken_returnsNull() throws Exception {
        Map<String, Object> result = verifier.verify("not-a-real-token-xyz");
        assertThat(result).isNull();
    }
}
