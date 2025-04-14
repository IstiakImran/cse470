Use DATABASE cse447;

-- User Table
CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_picture VARCHAR(255),
    contact_number VARCHAR(20) UNIQUE NOT NULL,
    address VARCHAR(255) NULL,
    division VARCHAR(255) NULL,
    district VARCHAR(255) NULL,
    upazila VARCHAR(255) NULL,
    city_corporation VARCHAR(255) NULL,
    latitude VARCHAR(20) NULL,
    longitude VARCHAR(20) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    phone_otp VARCHAR(6),
    phone_otp_expires_at DATETIME,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    email_otp VARCHAR(6),
    email_otp_expires_at DATETIME,
    is_email_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME
);

-- Post Table
CREATE TABLE Post (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    post_type VARCHAR(50) NOT NULL, -- 'public', 'friends', 'only_me'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Follow Table
CREATE TABLE Follow (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES User (id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Like Table
CREATE TABLE `Like` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Post (id) ON DELETE CASCADE
);

-- Comment Table
CREATE TABLE Comment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Post (id) ON DELETE CASCADE
);