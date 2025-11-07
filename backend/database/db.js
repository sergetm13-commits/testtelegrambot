const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'learning_platform.db');

// Создание подключения к базе данных
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка при подключении к базе данных:', err.message);
    } else {
        console.log('Подключено к базе данных SQLite.');
    }
});

// Включение внешних ключей
db.run('PRAGMA foreign_keys = ON');

// Промис-обертки для работы с базой данных
const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

// Методы для работы с пользователями
const createUser = async (telegramId, username, firstName, lastName) => {
    const sql = `
        INSERT OR IGNORE INTO users (telegram_id, username, first_name, last_name) 
        VALUES (?, ?, ?, ?)
    `;
    return await dbRun(sql, [telegramId, username, firstName, lastName]);
};

const getUserByTelegramId = async (telegramId) => {
    const sql = 'SELECT * FROM users WHERE telegram_id = ?';
    return await dbGet(sql, [telegramId]);
};

const updateUserActivity = async (userId) => {
    const sql = 'UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = ?';
    return await dbRun(sql, [userId]);
};

// Методы для работы с темами
const getAllTopics = async () => {
    const sql = `
        SELECT t.*, 
               (SELECT COUNT(*) FROM subtopics s WHERE s.topic_id = t.id) as subtopics_count
        FROM topics t 
        ORDER BY t.sort_order, t.title
    `;
    return await dbAll(sql);
};

const getTopicById = async (topicId) => {
    const sql = 'SELECT * FROM topics WHERE id = ?';
    return await dbGet(sql, [topicId]);
};

// Методы для работы с подтемами
const getSubtopicsByTopic = async (topicId) => {
    const sql = `
        SELECT s.*, 
               (SELECT COUNT(*) FROM lessons l WHERE l.subtopic_id = s.id) as lessons_count
        FROM subtopics s 
        WHERE s.topic_id = ? 
        ORDER BY s.sort_order, s.title
    `;
    return await dbAll(sql, [topicId]);
};

const getSubtopicById = async (subtopicId) => {
    const sql = 'SELECT * FROM subtopics WHERE id = ?';
    return await dbGet(sql, [subtopicId]);
};

// Методы для работы с уроками
const getLessonsBySubtopic = async (subtopicId) => {
    const sql = `
        SELECT l.*, 
               (SELECT COUNT(*) FROM lesson_media lm WHERE lm.lesson_id = l.id) as media_count
        FROM lessons l 
        WHERE l.subtopic_id = ? 
        ORDER BY l.sort_order, l.title
    `;
    return await dbAll(sql, [subtopicId]);
};

const getLessonById = async (lessonId) => {
    const sql = 'SELECT * FROM lessons WHERE id = ?';
    return await dbGet(sql, [lessonId]);
};

const getLessonWithMedia = async (lessonId) => {
    const sql = `
        SELECT l.*, s.title as subtopic_title, t.title as topic_title
        FROM lessons l
        JOIN subtopics s ON l.subtopic_id = s.id
        JOIN topics t ON s.topic_id = t.id
        WHERE l.id = ?
    `;
    const lesson = await dbGet(sql, [lessonId]);
    
    if (lesson) {
        const mediaSql = 'SELECT * FROM lesson_media WHERE lesson_id = ? ORDER BY sort_order';
        const media = await dbAll(mediaSql, [lessonId]);
        lesson.media = media;
    }
    
    return lesson;
};

// Методы для работы с прогрессом
const getUserProgress = async (userId) => {
    const sql = `
        SELECT l.id as lesson_id, l.title, l.subtopic_id, up.completed, up.completion_date
        FROM user_progress up
        JOIN lessons l ON up.lesson_id = l.id
        WHERE up.user_id = ?
        ORDER BY up.completion_date DESC
    `;
    return await dbAll(sql, [userId]);
};

const getUserProgressByTopic = async (userId, topicId) => {
    const sql = `
        SELECT l.id as lesson_id, l.title, l.subtopic_id, s.id as subtopic_id, s.title as subtopic_title,
               up.completed, up.completion_date
        FROM user_progress up
        JOIN lessons l ON up.lesson_id = l.id
        JOIN subtopics s ON l.subtopic_id = s.id
        WHERE up.user_id = ? AND s.topic_id = ?
        ORDER BY s.sort_order, l.sort_order
    `;
    return await dbAll(sql, [userId, topicId]);
};

const updateLessonProgress = async (userId, lessonId, completed, timeSpent = 0) => {
    const sql = `
        INSERT OR REPLACE INTO user_progress (user_id, lesson_id, completed, completion_date, time_spent, updated_at)
        VALUES (?, ?, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END, ?, CURRENT_TIMESTAMP)
    `;
    const result = await dbRun(sql, [userId, lessonId, completed, completed, timeSpent]);
    
    // Обновляем активность пользователя
    await updateUserActivity(userId);
    
    return result;
};

const getLessonProgress = async (userId, lessonId) => {
    const sql = 'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?';
    return await dbGet(sql, [userId, lessonId]);
};

// Методы для работы с избранным
const getUserFavorites = async (userId) => {
    const sql = `
        SELECT l.*, s.title as subtopic_title, t.title as topic_title, uf.created_at as favorited_date
        FROM user_favorites uf
        JOIN lessons l ON uf.lesson_id = l.id
        JOIN subtopics s ON l.subtopic_id = s.id
        JOIN topics t ON s.topic_id = t.id
        WHERE uf.user_id = ?
        ORDER BY uf.created_at DESC
    `;
    return await dbAll(sql, [userId]);
};

const addToFavorites = async (userId, lessonId) => {
    const sql = 'INSERT OR IGNORE INTO user_favorites (user_id, lesson_id) VALUES (?, ?)';
    const result = await dbRun(sql, [userId, lessonId]);
    
    // Обновляем активность пользователя
    await updateUserActivity(userId);
    
    return result;
};

const removeFromFavorites = async (userId, lessonId) => {
    const sql = 'DELETE FROM user_favorites WHERE user_id = ? AND lesson_id = ?';
    const result = await dbRun(sql, [userId, lessonId]);
    
    // Обновляем активность пользователя
    await updateUserActivity(userId);
    
    return result;
};

const isInFavorites = async (userId, lessonId) => {
    const sql = 'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ? AND lesson_id = ?';
    const result = await dbGet(sql, [userId, lessonId]);
    return result.count > 0;
};

// Статистика
const getUserStats = async (userId) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM user_progress WHERE user_id = ? AND completed = 1) as completed_lessons,
            (SELECT COUNT(*) FROM user_favorites WHERE user_id = ?) as favorite_lessons,
            (SELECT COUNT(*) FROM lessons) as total_lessons,
            (SELECT SUM(time_spent) FROM user_progress WHERE user_id = ? AND completed = 1) as total_time_spent
    `;
    return await dbGet(sql, [userId, userId, userId]);
};

// Экспорт всех функций
module.exports = {
    db,
    dbAll,
    dbGet,
    dbRun,
    
    // Пользователи
    createUser,
    getUserByTelegramId,
    updateUserActivity,
    
    // Темы
    getAllTopics,
    getTopicById,
    
    // Подтемы
    getSubtopicsByTopic,
    getSubtopicById,
    
    // Уроки
    getLessonsBySubtopic,
    getLessonById,
    getLessonWithMedia,
    
    // Прогресс
    getUserProgress,
    getUserProgressByTopic,
    updateLessonProgress,
    getLessonProgress,
    
    // Избранное
    getUserFavorites,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    
    // Статистика
    getUserStats
};