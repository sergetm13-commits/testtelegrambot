-- Создание таблиц для обучающей платформы

-- Таблица пользователей
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица тем
CREATE TABLE topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица подтем
CREATE TABLE subtopics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- Таблица уроков
CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subtopic_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text', -- text, markdown, html
    difficulty_level INTEGER DEFAULT 1, -- 1-5 уровень сложности
    estimated_time INTEGER DEFAULT 10, -- примерное время в минутах
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE CASCADE
);

-- Таблица прогресса пользователей
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_date DATETIME,
    time_spent INTEGER DEFAULT 0, -- время в минутах
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE(user_id, lesson_id)
);

-- Таблица избранного
CREATE TABLE user_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE(user_id, lesson_id)
);

-- Таблица для хранения медиафайлов уроков
CREATE TABLE lesson_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL,
    media_type TEXT NOT NULL, -- image, video, audio, document
    media_url TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Создание индексов для улучшения производительности
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_subtopics_topic_id ON subtopics(topic_id);
CREATE INDEX idx_lessons_subtopic_id ON lessons(subtopic_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_lesson_id ON user_favorites(lesson_id);
CREATE INDEX idx_lesson_media_lesson_id ON lesson_media(lesson_id);

-- Триггер для обновления времени последней активности
CREATE TRIGGER update_user_activity 
AFTER UPDATE ON user_progress
FOR EACH ROW
BEGIN
    UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = NEW.user_id;
END;