package com.financemanager.controller;

import com.financemanager.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

/**
 * 健康检查控制器
 * 与Node.js后端保持一致的健康检查端点
 */
@RestController
public class HealthController {

    private static final long START_TIME = System.currentTimeMillis();

    /**
     * 健康检查
     * GET /api/health
     */
    @GetMapping("/health")
    public Result<HealthInfo> health() {
        HealthInfo info = new HealthInfo();
        info.setStatus("ok");
        info.setTimestamp(Instant.now().toString());
        info.setUptime((System.currentTimeMillis() - START_TIME) / 1000.0);
        return Result.success(info);
    }

    @lombok.Data
    public static class HealthInfo {
        private String status;
        private String timestamp;
        private double uptime;
    }
}
