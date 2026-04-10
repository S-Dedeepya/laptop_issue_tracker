package com.laptoptracker.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.regex.Pattern;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter implements Filter {

    private static final Pattern VERCEL_PREVIEW_PATTERN =
        Pattern.compile("^https://laptop-issue-tracker-.*\\.vercel\\.app$");

    private static final String ALLOWED_HEADERS =
        "Origin, Content-Type, Accept, Authorization, X-Requested-With, content-type, *";

    private static final String ALLOWED_METHODS = "GET, POST, PUT, DELETE, PATCH, OPTIONS";

    private static final String EXPOSED_HEADERS = "Authorization";

    private boolean isAllowedOrigin(String origin) {
        return "https://laptop-issue-tracker.vercel.app".equals(origin)
            || VERCEL_PREVIEW_PATTERN.matcher(origin).matches()
            || "http://localhost:5173".equals(origin)
            || "http://localhost:5174".equals(origin)
            || "http://localhost:5175".equals(origin)
            || "http://localhost:3000".equals(origin);
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String origin = request.getHeader("Origin");

        if (origin != null && isAllowedOrigin(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
            response.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
            response.setHeader("Access-Control-Expose-Headers", EXPOSED_HEADERS);
            response.setHeader("Access-Control-Max-Age", "3600");
            response.setHeader("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers");
        }

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void destroy() {}
}