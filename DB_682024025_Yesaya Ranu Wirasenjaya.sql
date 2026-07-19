CREATE DATABASE portofolio_db;
USE portofolio_db;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pk PRIMARY KEY (id),
    CONSTRAINT users_username_uk UNIQUE (username)
);

CREATE TABLE profiles (
    id BIGINT AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    nama_lengkap VARCHAR(100),
    nama_panggilan VARCHAR(50),
    tempat_lahir VARCHAR(50),
    tanggal_lahir DATE,
    email VARCHAR(100),
    telepon VARCHAR(20),
    universitas VARCHAR(100),
    fakultas VARCHAR(100),
    prodi VARCHAR(100),
    semester VARCHAR(20),
    alamat TEXT,
    foto_url VARCHAR(255),
    CONSTRAINT profiles_pk PRIMARY KEY (id),
    CONSTRAINT profiles_users_fk FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE skills (
    id BIGINT AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    nama_skill VARCHAR(50),
    icon_class VARCHAR(50),
    CONSTRAINT skills_pk PRIMARY KEY (id),
    CONSTRAINT skills_users_fk FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE experiences (
    id BIGINT AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    posisi VARCHAR(100),
    perusahaan VARCHAR(100),
    durasi VARCHAR(50),
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT experiences_pk PRIMARY KEY (id),
    CONSTRAINT experiences_users_fk FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    judul VARCHAR(100),
    deskripsi TEXT,
    gambar_url VARCHAR(255),
    link_project VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT projects_pk PRIMARY KEY (id),
    CONSTRAINT projects_users_fk FOREIGN KEY (user_id) REFERENCES users(id)
);