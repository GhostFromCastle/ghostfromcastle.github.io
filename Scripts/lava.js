document.addEventListener('DOMContentLoaded', function() {    
    let activeSection = null;
    let lavaInterval = null;
    let isLavaActive = false;
    let lavaTimeout = null;
    
    // Расширенные настройки эффекта лавы
    const LAVA_CONFIG = {
        // Минимальное и максимальное количество капель за раз
        dropsPerBatch: { min: 1, max: 5 },

        // Интервал между партиями капель (в миллисекундах)
        batchInterval: { min: 1500, max: 4000 },

        // Варианты скоростей падения (в секундах)
        dropSpeeds: {
            fast: { min: 1.8, max: 2.2 },
            medium: { min: 2.5, max: 3.5 },
            slow: { min: 4.0, max: 5.5 }
        },

        // Вероятность разных размеров капель
        sizeProbabilities: {
            tiny: 0.15,   // 15%
            small: 0.25,  // 25%
            medium: 0.35, // 35%
            large: 0.15,  // 15%
            huge: 0.10    // 10%
        },

        // Вероятность разных скоростей
        speedProbabilities: {
            fast: 0.3,    
            medium: 0.3,
            slow: 0.4     
        },
        // Случайное смещение по горизонтали при падении (в пикселях)
        maxSway: 30,
        // Максимальное количество капель на экране одновременно
        maxTotalDrops: 12,
        // Задержка перед началом капания (в миллисекундах)
        startDelay: { min: 0, max: 800 },
        // Отступ от краев секции (в процентах)
        edgeMargin: 5,
        // Создавать ли искры
        createSparks: true,
        // Максимальное количество искр от одной капли
        maxSparksPerDrop: 3
    };
    
    // Массив для отслеживания активных капель
    const activeDrops = [];
    let totalDropCount = 0;
    
    // Инициализация системы лавы
    function initLavaSystem() {
        // Наблюдатель за секциями для определения активной
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Останавливаем лаву в предыдущей секции
                        if (activeSection && activeSection !== entry.target) {
                            stopLavaInSection(activeSection);
                        }
                        
                        // Запускаем лаву в новой активной секции
                        activeSection = entry.target;
                        startLavaInSection(activeSection);
                    } else if (entry.target === activeSection) {
                        // Если активная секция больше не видна
                        stopLavaInSection(activeSection);
                        activeSection = null;
                    }
                });
            },
            {
                threshold: 0.4,
                rootMargin: '0px'
            }
        );
        
        // Наблюдаем за всеми секциями
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }
    
    // Запуск эффекта лавы в секции
    function startLavaInSection(section) {
        if (!section || isLavaActive) return;
        isLavaActive = true;
        
        // Очищаем предыдущие интервалы и таймауты
        if (lavaInterval) clearInterval(lavaInterval);
        if (lavaTimeout) clearTimeout(lavaTimeout);
        
        // Запускаем первую партию капель с задержкой
        const initialDelay = getRandomInt(
            LAVA_CONFIG.startDelay.min, 
            LAVA_CONFIG.startDelay.max
        );
        
        lavaTimeout = setTimeout(() => {
            createLavaBatch(section);
            
            // Устанавливаем интервал для создания новых партий капель
            lavaInterval = setInterval(() => {
                if (activeDrops.length < LAVA_CONFIG.maxTotalDrops) {
                    createLavaBatch(section);
                }
            }, getRandomInt(
                LAVA_CONFIG.batchInterval.min, 
                LAVA_CONFIG.batchInterval.max
            ));
        }, initialDelay);
    }
    
    // Остановка эффекта лавы в секции
    function stopLavaInSection(section) {
        if (!section) return;
        isLavaActive = false;
        
        if (lavaInterval) {
            clearInterval(lavaInterval);
            lavaInterval = null;
        }
        
        if (lavaTimeout) {
            clearTimeout(lavaTimeout);
            lavaTimeout = null;
        }
    }
    
    // Создание партии капель (от 1 до 3)
    function createLavaBatch(section) {
        if (!section) return;
        
        const dropsCount = getRandomInt(
            LAVA_CONFIG.dropsPerBatch.min, 
            LAVA_CONFIG.dropsPerBatch.max
        );
        
        for (let i = 0; i < dropsCount; i++) {
            if (activeDrops.length >= LAVA_CONFIG.maxTotalDrops) break;
            
            // Задержка для каждой капли в партии (чтобы они появлялись не одновременно)
            const dropDelay = i * getRandomInt(100, 400);
            
            setTimeout(() => {
                createLavaDrop(section);
            }, dropDelay);
        }
    }
    
    // Создание одной капли лавы
    function createLavaDrop(section) {
        if (!section || activeDrops.length >= LAVA_CONFIG.maxTotalDrops) return;
        
        // Создаем основную каплю
        const drop = document.createElement('div');
        drop.className = 'lava-drop';
        
        // Выбираем случайный размер
        const size = getRandomSize();
        drop.classList.add(size);
        
        // Выбираем случайную скорость
        const speedType = getRandomSpeedType();
        const speed = getRandomSpeed(speedType);
        
        // Случайное смещение по горизонтали
        const swayAmount = getRandomInt(-LAVA_CONFIG.maxSway, LAVA_CONFIG.maxSway);
        drop.style.setProperty('--sway-amount', `${swayAmount}px`);
        
        // Позиционируем случайно по горизонтали
        const margin = LAVA_CONFIG.edgeMargin;
        const left = margin + Math.random() * (100 - 2 * margin);
        drop.style.left = `${left}%`;
        
        // Добавляем в секцию
        section.appendChild(drop);
        activeDrops.push(drop);
        totalDropCount++;
        
        // Добавляем хвост капли
        if (size !== 'tiny') {
            const tail = document.createElement('div');
            tail.className = 'lava-tail';
            tail.style.left = `${left}%`;
            section.appendChild(tail);
            
            // Анимация хвоста
            tail.style.opacity = '0.7';
            tail.style.animation = `sparkFall ${speed * 0.8}s ease-in forwards`;
            
            // Удаляем хвост
            setTimeout(() => {
                if (tail.parentElement) tail.remove();
            }, speed * 800);
        }
        
        // Создаем искры для больших капель
        if (LAVA_CONFIG.createSparks && (size === 'large' || size === 'huge')) {
            const sparkCount = getRandomInt(1, LAVA_CONFIG.maxSparksPerDrop);
            createSparks(section, left, sparkCount);
        }
        
        // Запускаем анимацию падения
        setTimeout(() => {
            drop.classList.add('falling');
            drop.style.opacity = '0.9';
            
            // Применяем анимацию падения с выбранной скоростью
            drop.style.animation = `${getAnimationName(speedType)} ${speed}s ease-in forwards`;
        }, 10);
        
        // Удаляем каплю после завершения анимации
        setTimeout(() => {
            removeLavaDrop(drop);
        }, speed * 1000 + 100);
    }
    
    // Создание искр
    function createSparks(section, leftPercent, count) {
        for (let i = 0; i < count; i++) {
            const spark = document.createElement('div');
            spark.className = 'lava-spark';
            
            // Случайное смещение относительно капли
            const offset = getRandomInt(-10, 10);
            spark.style.left = `calc(${leftPercent}% + ${offset}px)`;
            
            // Случайная задержка
            const delay = getRandomInt(0, 300);
            
            section.appendChild(spark);
            
            setTimeout(() => {
                spark.style.opacity = '1';
                spark.style.animation = `sparkFall ${getRandomFloat(1.5, 2.5)}s ease-in forwards`;
                
                // Удаляем искру
                setTimeout(() => {
                    if (spark.parentElement) spark.remove();
                }, getRandomInt(1500, 2500));
            }, delay);
        }
    }
    
    // Удаление капли лавы
    function removeLavaDrop(drop) {
        if (!drop) return;
        
        if (drop.parentElement) {
            drop.remove();
        }
        
        const index = activeDrops.indexOf(drop);
        if (index > -1) {
            activeDrops.splice(index, 1);
        }
    }
    
    // Вспомогательные функции
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    function getRandomSize() {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const [size, probability] of Object.entries(LAVA_CONFIG.sizeProbabilities)) {
            cumulative += probability;
            if (rand <= cumulative) {
                return size;
            }
        }
        
        return 'medium';
    }
    
    function getRandomSpeedType() {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const [speedType, probability] of Object.entries(LAVA_CONFIG.speedProbabilities)) {
            cumulative += probability;
            if (rand <= cumulative) {
                return speedType;
            }
        }
        
        return 'medium';
    }
    
    function getRandomSpeed(speedType) {
        const range = LAVA_CONFIG.dropSpeeds[speedType];
        return getRandomFloat(range.min, range.max);
    }
    
    function getAnimationName(speedType) {
        return `lavaFall${speedType.charAt(0).toUpperCase() + speedType.slice(1)}`;
    }
    
    // Очистка всех капель
    function cleanupAllLava() {
        if (lavaInterval) clearInterval(lavaInterval);
        if (lavaTimeout) clearTimeout(lavaTimeout);
        
        activeDrops.forEach(drop => {
            if (drop && drop.parentElement) {
                drop.remove();
            }
        });
        
        activeDrops.length = 0;
        totalDropCount = 0;
        
        // Удаляем все искры и хвосты
        document.querySelectorAll('.lava-spark, .lava-tail').forEach(el => {
            if (el.parentElement) el.remove();
        });
    }
    
    // Инициализация при загрузке
    initLavaSystem();
    
    // Очистка при выгрузке страницы
    window.addEventListener('beforeunload', cleanupAllLava);
    
    // Пауза при скролле для производительности
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        isScrolling = true;
        
        if (lavaInterval) {
            clearInterval(lavaInterval);
            lavaInterval = null;
        }
        
        setTimeout(() => {
            isScrolling = false;
            if (activeSection && isLavaActive && !lavaInterval) {
                lavaInterval = setInterval(() => {
                    if (activeDrops.length < LAVA_CONFIG.maxTotalDrops) {
                        createLavaBatch(activeSection);
                    }
                }, getRandomInt(
                    LAVA_CONFIG.batchInterval.min, 
                    LAVA_CONFIG.batchInterval.max
                ));
            }
        }, 500);
    });
    
    // Экспорт функций для отладки
    window.lavaDebug = {
        createBatch: () => activeSection && createLavaBatch(activeSection),
        createDrop: () => activeSection && createLavaDrop(activeSection),
        stopLava: () => activeSection && stopLavaInSection(activeSection),
        startLava: () => activeSection && startLavaInSection(activeSection),
        cleanup: cleanupAllLava,
        getStats: () => ({
            activeDrops: activeDrops.length,
            totalDrops: totalDropCount,
            isActive: isLavaActive,
            activeSection: activeSection?.id || 'none'
        }),
        config: LAVA_CONFIG
    };
});