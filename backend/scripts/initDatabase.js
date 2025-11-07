const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, '../database/learning_platform.db');
const schemaPath = path.join(__dirname, '../database/schema.sql');

// Создание или открытие базы данных
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка при открытии базы данных:', err.message);
        return;
    }
    console.log('База данных успешно подключена.');
});

// Чтение и выполнение SQL схемы
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('Ошибка при создании таблиц:', err.message);
        return;
    }
    console.log('Таблицы успешно созданы.');
    
    // Добавление тестовых данных
    addTestData();
});

function addTestData() {
    console.log('Добавление тестовых данных...');
    
    // Тестовые темы
    const topics = [
        { title: 'Программирование', description: 'Основы программирования и разработки', icon: '💻', sort_order: 1 },
        { title: 'Web-разработка', description: 'Создание веб-приложений и сайтов', icon: '🌐', sort_order: 2 },
        { title: 'Базы данных', description: 'Работа с базами данных', icon: '🗄️', sort_order: 3 },
        { title: 'DevOps', description: 'Развертывание и автоматизация', icon: '⚙️', sort_order: 4 }
    ];
    
    topics.forEach((topic, index) => {
        db.run(
            'INSERT OR IGNORE INTO topics (title, description, icon, sort_order) VALUES (?, ?, ?, ?)',
            [topic.title, topic.description, topic.icon, topic.sort_order],
            function(err) {
                if (err) {
                    console.error('Ошибка при добавлении темы:', err.message);
                    return;
                }
                if (this.changes > 0) {
                    console.log(`Тема "${topic.title}" добавлена`);
                    addSubtopics(this.lastID || (index + 1));
                }
            }
        );
    });
    
    setTimeout(() => {
        db.close((err) => {
            if (err) {
                console.error('Ошибка при закрытии базы данных:', err.message);
            } else {
                console.log('База данных инициализирована и закрыта.');
            }
        });
    }, 2000);
}

function addSubtopics(topicId) {
    const subtopics = {
        1: [ // Программирование
            { title: 'Основы Python', description: 'Изучение базового синтаксиса Python', sort_order: 1 },
            { title: 'Объектно-ориентированное программирование', description: 'ООП принципы и паттерны', sort_order: 2 },
            { title: 'Алгоритмы и структуры данных', description: 'Важные алгоритмы и структуры', sort_order: 3 }
        ],
        2: [ // Web-разработка
            { title: 'HTML и CSS', description: 'Основы веб-разметки и стилей', sort_order: 1 },
            { title: 'JavaScript', description: 'Программирование для веба', sort_order: 2 },
            { title: 'React', description: 'Современная библиотека для UI', sort_order: 3 }
        ],
        3: [ // Базы данных
            { title: 'SQL основы', description: 'Язык запросов SQL', sort_order: 1 },
            { title: 'PostgreSQL', description: 'Реляционная база данных', sort_order: 2 },
            { title: 'MongoDB', description: 'NoSQL база данных', sort_order: 3 }
        ],
        4: [ // DevOps
            { title: 'Git и GitHub', description: 'Система контроля версий', sort_order: 1 },
            { title: 'Docker', description: 'Контейнеризация приложений', sort_order: 2 },
            { title: 'CI/CD', description: 'Непрерывная интеграция и доставка', sort_order: 3 }
        ]
    };
    
    const subtopicList = subtopics[topicId] || [];
    
    subtopicList.forEach((subtopic, subIndex) => {
        db.run(
            'INSERT OR IGNORE INTO subtopics (topic_id, title, description, sort_order) VALUES (?, ?, ?, ?)',
            [topicId, subtopic.title, subtopic.description, subtopic.sort_order],
            function(err) {
                if (err) {
                    console.error('Ошибка при добавлении подтемы:', err.message);
                    return;
                }
                if (this.changes > 0) {
                    console.log(`Подтема "${subtopic.title}" добавлена`);
                    addLessons(this.lastID || (topicId * 10 + subIndex + 1), topicId, subIndex + 1);
                }
            }
        );
    });
}

function addLessons(subtopicId, topicId, subtopicNum) {
    const lessons = {
        '1-1': [ // Python основы
        { title: 'Введение в Python', content: 'Python - это высокоуровневый язык программирования с простым синтаксисом...', difficulty_level: 1, estimated_time: 15 },
        { title: 'Переменные и типы данных', content: 'В Python переменные создаются при присвоении значения...', difficulty_level: 1, estimated_time: 20 },
        { title: 'Условные операторы', content: 'Условные операторы позволяют выполнять разный код в зависимости от условий...', difficulty_level: 2, estimated_time: 25 }
        ],
        '1-2': [ // ООП
        { title: 'Классы и объекты', content: 'Класс - это шаблон для создания объектов...', difficulty_level: 2, estimated_time: 30 },
        { title: 'Наследование', content: 'Наследование позволяет создавать новые классы на основе существующих...', difficulty_level: 3, estimated_time: 35 }
        ],
        '2-1': [ // HTML/CSS
        { title: 'HTML структура', content: 'HTML использует теги для структурирования контента...', difficulty_level: 1, estimated_time: 20 },
        { title: 'CSS селекторы', content: 'CSS селекторы определяют, к каким элементам применяются стили...', difficulty_level: 2, estimated_time: 25 }
        ]
    };
    
    const key = `${topicId}-${subtopicNum}`;
    const lessonList = lessons[key] || [
        { title: 'Введение', content: 'Основные концепции и введение в тему...', difficulty_level: 1, estimated_time: 15 },
        { title: 'Практика', content: 'Практические задания и примеры...', difficulty_level: 2, estimated_time: 20 }
    ];
    
    lessonList.forEach((lesson, lessonIndex) => {
        db.run(
            'INSERT OR IGNORE INTO lessons (subtopic_id, title, content, difficulty_level, estimated_time, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [subtopicId, lesson.title, lesson.content, lesson.difficulty_level, lesson.estimated_time, lessonIndex + 1],
            function(err) {
                if (err) {
                    console.error('Ошибка при добавлении урока:', err.message);
                    return;
                }
                if (this.changes > 0) {
                    console.log(`Урок "${lesson.title}" добавлен`);
                }
            }
        );
    });
}