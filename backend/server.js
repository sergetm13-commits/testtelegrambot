const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const TelegramLearningBot = require('./bot/telegramBot');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API маршруты
app.use('/api', apiRoutes);

// Статические файлы (если нужно)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Главная страница API
app.get('/', (req, res) => {
    res.json({
        message: 'Learning Platform API',
        version: '1.0.0',
        endpoints: {
            topics: '/api/topics',
            user: '/api/users/:id',
            progress: '/api/users/:id/progress',
            favorites: '/api/users/:id/favorites',
            health: '/api/health'
        },
        timestamp: new Date().toISOString()
    });
});

// Обработка 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Маршрут не найден',
        message: `Маршрут ${req.originalUrl} не существует`
    });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('Глобальная ошибка:', err);
    res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Произошла внутренняя ошибка'
    });
});

// Запуск сервера
const server = app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📡 API доступен по адресу: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Инициализация Telegram бота
let telegramBot;
if (process.env.TELEGRAM_BOT_TOKEN) {
    try {
        telegramBot = new TelegramLearningBot(process.env.TELEGRAM_BOT_TOKEN);
        console.log('🤖 Telegram бот успешно инициализирован');
    } catch (error) {
        console.error('❌ Ошибка инициализации Telegram бота:', error.message);
        console.log('Продолжаем работу без Telegram бота...');
    }
} else {
    console.log('⚠️  TELEGRAM_BOT_TOKEN не установлен. Telegram бот не будет запущен.');
    console.log('Для запуска бота установите переменную окружения TELEGRAM_BOT_TOKEN');
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Получен SIGTERM, завершаем работу...');
    server.close(() => {
        console.log('Сервер остановлен');
        if (telegramBot) {
            // Остановка Telegram бота
            console.log('Telegram бот остановлен');
        }
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Получен SIGINT, завершаем работу...');
    server.close(() => {
        console.log('Сервер остановлен');
        if (telegramBot) {
            // Остановка Telegram бота
            console.log('Telegram бот остановлен');
        }
        process.exit(0);
    });
});

module.exports = app;