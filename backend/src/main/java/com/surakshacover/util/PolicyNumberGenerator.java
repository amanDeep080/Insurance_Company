package com.surakshacover.util;

import java.security.SecureRandom;

public class PolicyNumberGenerator {

    private static final SecureRandom random = new SecureRandom();

    public static String generate(String policyType) {
        String prefix = policyType.length() >= 3
                ? policyType.substring(0, 3).toUpperCase()
                : policyType.toUpperCase();
        int rand = 100000 + random.nextInt(900000);
        return "SC-" + prefix + "-" + rand;
    }
}
