const TelegramBot = require('node-telegram-bot-api');
const db = require('../database/db');

class TelegramLearningBot {
    constructor(token) {
        this.bot = new TelegramBot(token, { polling: true });
        this.setupCommands();
        this.setupCallbacks();
        console.log('Telegram бот инициализирован');
    }

    setupCommands() {
        // Команда /start
        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;
            const username = msg.from.username;
            const firstName = msg.from.first_name;
            const lastName = msg.from.last_name;

            try {
                // Создаем или обновляем пользователя
                await db.createUser(userId, username, firstName, lastName);
                
                const welcomeMessage = `
Привет! Добро пожаловать в Soft Skills Hub — место, где ты прокачаешь себя по-настоящему. 
Здесь всё просто: короткие уроки, реальные навыки и максимум пользы. 
Учись в своём темпе, применяй на практике и расти каждый день. 
Давай начнём!
                `;

                const webAppUrl = process.env.WEB_APP_URL || 'https://google.com';
                
                this.bot.sendMessage(chatId, welcomeMessage, {
                    reply_markup: {
                        keyboard: [
                            [{ text: '📚 Учиться', web_app: { url: webAppUrl } }],
                            [{ text: '⭐ Избранное' }, { text: '🆘 Поддержка' }]
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: false
                    }
                });
            } catch (error) {
                console.error('Ошибка при обработке команды /start:', error);
                this.bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
            }
        });

        // Команда /help
        this.bot.onText(/\/help/, (msg) => {
            const chatId = msg.chat.id;
            const webAppUrl = process.env.WEB_APP_URL || 'https://google.com';
            const helpMessage = `
🎯 *Soft Skills Hub — твой проводник в мире навыков*

*Как пользоваться ботом:*
📚 **Учиться** — открывает обучающую платформу с темами и уроками
⭐ **Избранное** — показывает сохраненные уроки
🆘 **Поддержка** — помощь и контакты

*Принципы обучения:*
• Учись в своём темпе
• Применяй на практике
• Расти каждый день
• Сохраняй важное в избранное

*Советы:*
— Начинай с основных тем
— Повторяй пройденное
— Применяй на практике
— Не спеши, но будь настойчивым

*Полная версия платформы:* ${webAppUrl}
            `;
            
            this.bot.sendMessage(chatId, helpMessage, { 
                parse_mode: 'Markdown'
            });
        });

        // Команда /topics
        this.bot.onText(/\/topics/, async (msg) => {
            await this.showTopics(msg.chat.id);
        });

        // Команда /progress
        this.bot.onText(/\/progress/, async (msg) => {
            await this.showProgress(msg.chat.id, msg.from.id);
        });

        // Команда /favorites
        this.bot.onText(/\/favorites/, async (msg) => {
            await this.showFavorites(msg.chat.id, msg.from.id);
        });

        // Обработка текстовых сообщений (кнопки быстрого доступа)
        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;

            if (text === '📚 Учиться') {
                const webAppUrl = process.env.WEB_APP_URL || 'https://google.com';
                this.bot.sendMessage(chatId, '📚 Добро пожаловать в обучение! Открываю обучающую платформу...', {
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '🚀 Начать обучение', web_app: { url: webAppUrl } }
                        ]]
                    }
                });
            } else if (text === '⭐ Избранное') {
                await this.showFavorites(chatId, msg.from.id);
            } else if (text === '🆘 Поддержка') {
                await this.showSupport(chatId);
            }
        });
    }

    setupCallbacks() {
        // Обработка callback_query (инлайн кнопки)
        this.bot.on('callback_query', async (callbackQuery) => {
            const chatId = callbackQuery.message.chat.id;
            const userId = callbackQuery.from.id;
            const data = callbackQuery.data;

            try {
                // Разбираем callback данные
                const [action, ...params] = data.split(':');

                switch (action) {
                    case 'topic':
                        const topicId = parseInt(params[0]);
                        await this.showSubtopics(chatId, topicId);
                        break;

                    case 'subtopic':
                        const subtopicId = parseInt(params[0]);
                        await this.showLessons(chatId, userId, subtopicId);
                        break;

                    case 'lesson':
                        const lessonId = parseInt(params[0]);
                        await this.showLesson(chatId, userId, lessonId);
                        break;

                    case 'complete':
                        const completeLessonId = parseInt(params[0]);
                        await this.markLessonComplete(chatId, userId, completeLessonId);
                        break;

                    case 'favorite':
                        const favLessonId = parseInt(params[0]);
                        await this.toggleFavorite(chatId, userId, favLessonId);
                        break;

                    case 'back':
                        const backAction = params[0];
                        if (backAction === 'topics') {
                            await this.showTopics(chatId);
                        } else if (backAction.startsWith('subtopics:')) {
                            const topicId = parseInt(backAction.split(':')[1]);
                            await this.showSubtopics(chatId, topicId);
                        }
                        break;

                    default:
                        this.bot.sendMessage(chatId, 'Неизвестная команда.');
                }

                // Отвечаем на callback_query
                this.bot.answerCallbackQuery(callbackQuery.id);
            } catch (error) {
                console.error('Ошибка при обработке callback_query:', error);
                this.bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
                this.bot.answerCallbackQuery(callbackQuery.id);
            }
        });
    }

    async showTopics(chatId) {
        try {
            const topics = await db.getAllTopics();
            
            if (topics.length === 0) {
                this.bot.sendMessage(chatId, 'Пока нет доступных тем.');
                return;
            }

            const message = '📚 *Доступные темы для изучения:*\n\nВыберите тему:';
            
            const keyboard = {
                inline_keyboard: topics.map(topic => [{
                    text: `${topic.icon} ${topic.title} (${topic.subtopics_count} подтем)`,
                    callback_data: `topic:${topic.id}`
                }])
            };

            this.bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            console.error('Ошибка при показе тем:', error);
            this.bot.sendMessage(chatId, 'Произошла ошибка при загрузке тем.');
        }
    }

    async showSubtopics(chatId, topicId) {
        try {
            const topic = await db.getTopicById(topicId);
            const subtopics = await db.getSubtopicsByTopic(topicId);
            
            if (subtopics.length === 0) {
                this.bot.sendMessage(chatId, `В теме "${topic.title}" пока нет подтем.`);
                return;
            }

            const message = `📚 *${topic.title}*\n\nВыберите подтему:`;
            
            const keyboard = {
                inline_keyboard: [
                    ...subtopics.map(subtopic => [{
                        text: `${subtopic.title} (${subtopic.lessons_count} уроков)`,
                        callback_data: `subtopic:${subtopic.id}`
                    }]),
                    [{ text: '⬅️ Назад к темам', callback_data: 'back:topics' }]
                ]
            };

            this.bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            console.error('Ошибка при показе подтем:', error);
            this.bot.sendMessage(chatId, 'Произошла ошибка при загрузке подтем.');
        }
    }

    async showLessons(chatId, userId, subtopicId) {
        try {
            const subtopic = await db.getSubtopicById(subtopicId);
            const lessons = await db.getLessonsBySubtopic(subtopicId);
            const topic = await db.getTopicById(subtopic.topic_id);
            
            if (lessons.length === 0) {
                this.bot.sendMessage(chatId, `В подтеме "${subtopic.title}" пока нет уроков.`);
                return;
            }

            // Получаем прогресс пользователя по этим урокам
            const progressPromises = lessons.map(lesson => 
                db.getLessonProgress(userId, lesson.id)
            );
            const progressResults = await Promise.all(progressPromises);

            const message = `📖 *${topic.title} → ${subtopic.title}*\n\nДоступные уроки:`;
            
            const keyboard = {
                inline_keyboard: [
                    ...lessons.map((lesson, index) => {
                        const progress = progressResults[index];
                        const isCompleted = progress && progress.completed;
                        const difficultyEmoji = '🔥'.repeat(lesson.difficulty_level);
                        
                        return [{
                            text: `${isCompleted ? '✅' : '📖'} ${lesson.title} ${difficultyEmoji}`,
                            callback_data: `lesson:${lesson.id}`
                        }];
                    }),
                    [{ text: '⬅️ Назад к подтемам', callback_data: `back:subtopics:${subtopic.topic_id}` }]
                ]
            };

            this.bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            console.error('Ошибка при показе уроков:', error);
            this.bot.sendMessage(chatId, 'Произошла ошибка при загрузке уроков.');
        }
    }

    async showLesson(chatId, userId, lessonId) {
        try {
            const lesson = await db.getLessonWithMedia(lessonId);
            if (!lesson) {
                this.bot.sendMessage(chatId, 'Урок не найден.');
                return;
            }

            // Проверяем, в избранном ли урок
            const isFavorite = await db.isInFavorites(userId, lessonId);
            const progress = await db.getLessonProgress(userId, lessonId);
            const isCompleted = progress && progress.completed;

            const message = `
📖 *${lesson.title}*

📝 *Содержание:*
${lesson.content}

⏱️ *Примерное время:* ${lesson.estimated_time} минут
🔥 *Сложность:* ${'🔥'.repeat(lesson.difficulty_level)}
📍 *Тема:* ${lesson.topic_title} → ${lesson.subtopic_title}
            `;

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: isCompleted ? '❌ Отменить завершение' : '✅ Отметить завершенным', callback_data: `complete:${lesson.id}` },
                        { text: isFavorite ? '⭐ Убрать из избранного' : '☆ Добавить в избранное', callback_data: `favorite:${lesson.id}` }
                    ],
                    [{ text: '⬅️ Назад к урокам', callback_data: `subtopic:${lesson.subtopic_id}` }]
                ]
            };

            this.bot.sendMessage(chatId, message.trim(), {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            console.error('Ошибка при показе урока:', error);
            this.bot.sendMessage(chatId, 'Произошла ошибка при загрузке урока.');
        }
    }

    async markLessonComplete(chatId, userId, lessonId) {
        try {
            const progress = await db.getLessonProgress(userId, lessonId);
            const newStatus = !(progress && progress.completed); // Инвертируем статус
            
            await db.updateLessonProgress(userId, lessonId, newStatus);
            
            const message = newStatus ? '✅ Урок отмечен как завершенный!' : '❌ Статус завершения убран.';
            this.bot.sendMessage(chatId, message);
            
            // Показываем урок снова с обновленным статусом
            setTimeout(() => {
                this.showLesson(chatId, userId, lessonId);
            }, 1000);
        } catch (error) {
            console.error('Ошибка при обновлении прогресса:', error);
            this.bot.sendMessage(chatId, 'Произошла ошибка при обновлении прогресса.');
        }
    }

    async toggleFavorite(chatId, userId, lessonId) {
        try {
            const isFavorite = await db.isInFavorites(userId, lessonId);
            
            if (isFavorite) {
                await db.removeFromFavorites(userId, lessonId);
                this.bot.sendMessage(chatId, '⭐ Урок удален из избранного.');
            } else {
                await db.addToFavorites(userId, lessonId);
                this.bot.sendMessage(chatId, '⭐ Урок добавлен в избранное!');
            }
            
            // Показываем урок снова с обновленным статусом
            setTimeout(() => {
                this.showLesson(chatId, userId, lessonId);
            }, 1000);
        } catch (error) {
            console.error('Ошибка при работе с избранным:', error);
            this.bot.sendMessage(chatId, 'Произошла ошибка при работе с избранным.');
        }
    }

    async showProgress(chatId, userId) {
        try {
            const stats = await db.getUserStats(userId);
            const progress = await db.getUserProgress(userId);
            
            const completionRate = stats.total_lessons > 0 
                ? Math.round((stats.completed_lessons / stats.total_lessons) * 100) 
                : 0;

            const message = `
📊 *Твой прогресс в Soft Skills Hub*

✅ *Завершено уроков:* ${stats.completed_lessons} из ${stats.total_lessons}
📈 *Процент завершения:* ${completionRate}%
⭐ *В избранном:* ${stats.favorite_lessons} уроков
⏱️ *Общее время:* ${stats.total_time_spent || 0} минут

${progress.length > 0 ? '*Последние завершенные уроки:*' : ''}
${progress.slice(0, 5).map(p => `• ${p.title} (${p.completion_date})`).join('\n')}

Продолжай в том же духе! 💪
            `;

            this.bot.sendMessage(chatId, message.trim(), { 
                parse_mode: 'Markdown'
            });
        } catch (error) {
            console.error('Ошибка при показе прогресса:', error);
            this.bot.sendMessage(chatId, 'Произошла ошибка при загрузке прогресса.');
        }
    }

    async showFavorites(chatId, userId) {
        try {
            const favorites = await db.getUserFavorites(userId);
            
            if (favorites.length === 0) {
                this.bot.sendMessage(chatId, '⭐ У вас пока нет избранных уроков.');
                return;
            }

            const message = '⭐ *Ваши избранные уроки:*\n\n';
            
            const keyboard = {
                inline_keyboard: favorites.map(favorite => [{
                    text: `📖 ${favorite.title} (${favorite.topic_title} → ${favorite.subtopic_title})`,
                    callback_data: `lesson:${favorite.id}`
                }])
            };

            this.bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            console.error('Ошибка при показе избранного:', error);
            this.bot.sendMessage(chatId, 'Произошла ошибка при загрузке избранного.');
        }
    }

    async showSupport(chatId) {
        try {
            const supportMessage = `
🆘 *Поддержка Soft Skills Hub*

*Помощь по использованию бота:*
📚 **Учиться** — открывает обучающую платформу
⭐ **Избранное** — показывает сохраненные уроки
🆘 **Поддержка** — эта справка

*Частые вопросы:*
❓ *Как начать обучение?*
Нажмите кнопку "📚 Учиться" и перейдите на платформу

❓ *Где мои сохраненные уроки?*
Все избранные уроки в разделе "⭐ Избранное"

❓ *Как связаться с поддержкой?*
Если возникли вопросы, пишите нам в Telegram

*Контакты:*
📧 Email: support@softskillshub.com
📱 Telegram: @softskillssupport

*Мы всегда рады помочь!* 🚀
            `;

            this.bot.sendMessage(chatId, supportMessage.trim(), {
                parse_mode: 'Markdown'
            });
        } catch (error) {
            console.error('Ошибка при показе поддержки:', error);
            this.bot.sendMessage(chatId, 'Произошла ошибка при загрузке информации о поддержке.');
        }
    }

}

module.exports = TelegramLearningBot;