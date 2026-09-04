-- =========================================================
-- Campus Food Ordering System - Database Schema
-- The Polytechnic Ibadan
-- =========================================================

CREATE DATABASE IF NOT EXISTS campus_food_ordering
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE campus_food_ordering;

mysql://${{MYSQLUSER}}:${{MYSQLPASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}/${{MYSQLDATABASE}}