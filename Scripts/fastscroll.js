document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('section, footer');
    createSectionIndicators(sections);
    setupScrollSnap(sections);
    setupIndicatorClicks(sections);
    setupKeyboardNavigation(sections);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                const idx = Array.from(sections).indexOf(targetElement);
                if (idx !== -1) {
                    updateActiveSection(idx);
                }
            }
        });
    });
});

function createSectionIndicators(sections) {
    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'section-indicator';

    sections.forEach((section, index) => {
        const dot = document.createElement('div');
        dot.className = 'section-dot';
        dot.dataset.index = index;
        dot.title = section.querySelector('h1, h2')?.textContent || `Секция ${index + 1}`;
        indicatorContainer.appendChild(dot);
    });

    document.body.appendChild(indicatorContainer);
}

function setupScrollSnap(sections) {
    const main = document.querySelector('main');
    let isScrolling = false;
    let scrollTimeout;

    main.addEventListener('scroll', function () {
        if (isScrolling) return;
        clearTimeout(scrollTimeout);

        const scrollPosition = main.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = main.scrollHeight;
        const isAtBottom = scrollPosition + windowHeight >= documentHeight - 50;

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            let sectionActive = false;

            if (index === sections.length - 1 && isAtBottom) {
                sectionActive = true;
            } 

            else {
                sectionActive = scrollPosition >= sectionTop - windowHeight / 3 &&
                               scrollPosition < sectionTop + sectionHeight - windowHeight / 3;
            }

            if (sectionActive) {
                updateActiveSection(index);
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 100);
    });

    if (sections[0]) {
        sections[0].classList.add('active');
        updateActiveSection(0);
    }
}

function updateActiveSection(activeIndex) {
    document.querySelectorAll('.section-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}

function setupIndicatorClicks(sections) {
    document.querySelectorAll('.section-dot').forEach(dot => {
        dot.addEventListener('click', function () {
            const index = parseInt(this.dataset.index, 10);
            if (sections[index]) {
                // Для последней секции скроллим в самый низ
                if (index === sections.length - 1) {
                    const main = document.querySelector('main');
                    main.scrollTo({
                        top: main.scrollHeight - window.innerHeight,
                        behavior: 'smooth'
                    });
                } else {
                    sections[index].scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                updateActiveSection(index);
            }
        });
    });
}

function setupKeyboardNavigation(sections) {
    document.addEventListener('keydown', function (e) {
        const currentIndex = getCurrentSectionIndex(sections);

        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            scrollToNextSection(sections, currentIndex);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scrollToPrevSection(sections, currentIndex);
        } else if (e.key === 'Home') {
            e.preventDefault();
            sections[0]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            updateActiveSection(0);
        } else if (e.key === 'End') {
            e.preventDefault();

            const main = document.querySelector('main');
            main.scrollTo({
                top: main.scrollHeight - window.innerHeight,
                behavior: 'smooth'
            });
            updateActiveSection(sections.length - 1);
        }
    });
}

function getCurrentSectionIndex(sections) {
    const main = document.querySelector('main');
    const scrollPos = main.scrollTop;
    const winH = window.innerHeight;
    const docHeight = main.scrollHeight;
    const isAtBottom = scrollPos + winH >= docHeight - 50;

    if (isAtBottom) {
        return sections.length - 1;
    }

    for (let i = 0; i < sections.length; i++) {
        const secTop = sections[i].offsetTop;
        const secHeight = sections[i].offsetHeight;
        if (scrollPos >= secTop - winH / 3 && scrollPos < secTop + secHeight - winH / 3) {
            return i;
        }
    }
    return 0;
}

function scrollToNextSection(sections, idx) {
    if (idx < sections.length - 1) {

        if (idx === sections.length - 2) {
            const main = document.querySelector('main');
            main.scrollTo({
                top: main.scrollHeight - window.innerHeight,
                behavior: 'smooth'
            });
        } else {
            sections[idx + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        updateActiveSection(idx + 1);
    }
}

function scrollToPrevSection(sections, idx) {
    if (idx > 0) {
        sections[idx - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        updateActiveSection(idx - 1);
    }
}