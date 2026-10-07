CREATE DATABASE IF NOT EXISTS oppeainete_tagasiside
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE oppeainete_tagasiside;

CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(30) NOT NULL,
    subject_id INT NOT NULL,
    rating TINYINT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (subject_id)
        REFERENCES subjects(id),

    CHECK (rating BETWEEN 1 AND 5)
);

INSERT IGNORE INTO subjects (name) VALUES
    ('Matemaatika'),
    ('Vene keel'),
    ('Andmebaasid'),
    ('Inglise keel'),
    ('Eesti keel');