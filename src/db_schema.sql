CREATE TABLE `users` (
    `id` INT(10) PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `date_created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `user_sessions` (
    `id` INT(10) PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT(10) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expiry_date` DATETIME NOT NULL  ,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);