package com.laptoptracker.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String origin = request.getHeader("Origin");

        // Allow specific origins
        if (origin != null && (
            origin.equals("https://laptop-issue-tracker.vercel.app") ||
            origin.matches("https://laptop-issue-tracker-.*\\.vercel\\.app") ||
            origin.equals("http://localhost:5173") ||
            origin.equals("http://localhost:3000") ||
            origin.equals("http://localhost:5174") ||
            origin.equals("http://localhost:5175")
        )) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            response.setHeader("Access-Control-Allow-Headers", "*");
            response.setHeader("Access-Control-Expose-Headers", "Authorization");
            response.setHeader("Access-Control-Max-Age", "3600");
        }

        // Handle preflight OPTIONS request immediately
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