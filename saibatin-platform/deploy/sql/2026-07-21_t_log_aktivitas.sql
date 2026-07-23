-- Update DB produksi cPanel — fitur Log Aktivitas Admin (2026-07-21).
-- HANYA menambah 1 tabel baru; tidak menyentuh tabel/data lain. TANPA seed.
--
-- Cara pakai: cPanel → phpMyAdmin → pilih database saibatin → tab SQL →
-- tempel seluruh isi file ini → Go. Aman dijalankan sekali; kalau diulang
-- akan error "table already exists" (tidak merusak apa pun).

CREATE TABLE `t_log_aktivitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `aksi` VARCHAR(191) NOT NULL,
    `entitas` VARCHAR(191) NOT NULL,
    `entitas_id` VARCHAR(191) NULL,
    `ringkasan` TEXT NOT NULL,
    `ip_address` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `t_log_aktivitas_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `t_log_aktivitas_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `t_log_aktivitas` ADD CONSTRAINT `t_log_aktivitas_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
