const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Middleware для обработки ошибок
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// === API ENDPOINTS ===

// Получить все темы
router.get('/topics', asyncHandler(async (req, res) => {
    try {
        const topics = await db.getAllTopics();
        res.json({
            success: true,
            data: topics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении тем',
            message: error.message
        });
    }
}));

// Получить тему по ID
router.get('/topics/:id', asyncHandler(async (req, res) => {
    try {
        const topicId = parseInt(req.params.id);
        const topic = await db.getTopicById(topicId);
        
        if (!topic) {
            return res.status(404).json({
                success: false,
                error: 'Тема не найдена'
            });
        }
        
        res.json({
            success: true,
            data: topic
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении темы',
            message: error.message
        });
    }
}));

// Получить подтемы темы
router.get('/topics/:id/subtopics', asyncHandler(async (req, res) => {
    try {
        const topicId = parseInt(req.params.id);
        const subtopics = await db.getSubtopicsByTopic(topicId);
        
        res.json({
            success: true,
            data: subtopics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении подтем',
            message: error.message
        });
    }
}));

// Получить уроки подтемы
router.get('/subtopics/:id/lessons', asyncHandler(async (req, res) => {
    try {
        const subtopicId = parseInt(req.params.id);
        const lessons = await db.getLessonsBySubtopic(subtopicId);
        
        res.json({
            success: true,
            data: lessons
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении уроков',
            message: error.message
        });
    }
}));

// Получить урок по ID
router.get('/lessons/:id', asyncHandler(async (req, res) => {
    try {
        const lessonId = parseInt(req.params.id);
        const lesson = await db.getLessonWithMedia(lessonId);
        
        if (!lesson) {
            return res.status(404).json({
                success: false,
                error: 'Урок не найден'
            });
        }
        
        res.json({
            success: true,
            data: lesson
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении урока',
            message: error.message
        });
    }
}));

// === USER-SPECIFIC ENDPOINTS ===

// Получить или создать пользователя по Telegram ID
router.post('/users/telegram/:telegramId', asyncHandler(async (req, res) => {
    try {
        const telegramId = parseInt(req.params.telegramId);
        const { username, firstName, lastName } = req.body;
        
        // Проверяем существует ли пользователь
        let user = await db.getUserByTelegramId(telegramId);
        
        if (!user) {
            // Создаем нового пользователя
            const result = await db.createUser(telegramId, username, firstName, lastName);
            user = await db.getUserByTelegramId(telegramId);
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при работе с пользователем',
            message: error.message
        });
    }
}));

// Получить пользователя по ID
router.get('/users/:id', asyncHandler(async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const sql = 'SELECT * FROM users WHERE id = ?';
        const user = await db.dbGet(sql, [userId]);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении пользователя',
            message: error.message
        });
    }
}));

// Получить прогресс пользователя
router.get('/users/:id/progress', asyncHandler(async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const progress = await db.getUserProgress(userId);
        
        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении прогресса',
            message: error.message
        });
    }
}));

// Получить прогресс пользователя по теме
router.get('/users/:userId/progress/topics/:topicId', asyncHandler(async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const topicId = parseInt(req.params.topicId);
        const progress = await db.getUserProgressByTopic(userId, topicId);
        
        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении прогресса по теме',
            message: error.message
        });
    }
}));

// Обновить прогресс урока
router.post('/users/:id/progress', asyncHandler(async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { lessonId, completed, timeSpent = 0 } = req.body;
        
        if (!lessonId || completed === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Необходимы параметры lessonId и completed'
            });
        }
        
        const result = await db.updateLessonProgress(userId, lessonId, completed, timeSpent);
        
        res.json({
            success: true,
            message: 'Прогресс обновлен',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при обновлении прогресса',
            message: error.message
        });
    }
}));

// Получить избранное пользователя
router.get('/users/:id/favorites', asyncHandler(async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const favorites = await db.getUserFavorites(userId);
        
        res.json({
            success: true,
            data: favorites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении избранного',
            message: error.message
        });
    }
}));

// Добавить в избранное
router.post('/users/:id/favorites', asyncHandler(async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { lessonId } = req.body;
        
        if (!lessonId) {
            return res.status(400).json({
                success: false,
                error: 'Необходим параметр lessonId'
            });
        }
        
        const result = await db.addToFavorites(userId, lessonId);
        
        res.json({
            success: true,
            message: 'Урок добавлен в избранное',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при добавлении в избранное',
            message: error.message
        });
    }
}));

// Удалить из избранного
router.delete('/users/:id/favorites/:lessonId', asyncHandler(async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const lessonId = parseInt(req.params.lessonId);
        
        const result = await db.removeFromFavorites(userId, lessonId);
        
        res.json({
            success: true,
            message: 'Урок удален из избранного',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при удалении из избранного',
            message: error.message
        });
    }
}));

// Проверить, в избранном ли урок
router.get('/users/:id/favorites/:lessonId/check', asyncHandler(async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const lessonId = parseInt(req.params.lessonId);
        
        const isFavorite = await db.isInFavorites(userId, lessonId);
        
        res.json({
            success: true,
            data: { isFavorite }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при проверке избранного',
            message: error.message
        });
    }
}));

// Получить статистику пользователя
router.get('/users/:id/stats', asyncHandler(async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const stats = await db.getUserStats(userId);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении статистики',
            message: error.message
        });
    }
}));

// === HEALTH CHECK ===
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API работает нормально',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;