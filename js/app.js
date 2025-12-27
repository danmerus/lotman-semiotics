// Основная логика приложения

// Показать панель с информацией об учёном
function showScholarPanel(scholar) {
  const panel = document.getElementById('info-panel');
  const content = panel.querySelector('.panel-content');

  // Заполняем данные
  panel.querySelector('.panel-name').textContent = scholar.name;
  panel.querySelector('.panel-years').textContent = scholar.years;
  panel.querySelector('.panel-bio').textContent = scholar.fullBio;

  // Научные интересы
  const interestsList = panel.querySelector('.panel-interests');
  interestsList.innerHTML = '';
  scholar.interests.forEach(interest => {
    const li = document.createElement('li');
    li.textContent = interest;
    interestsList.appendChild(li);
  });

  // Достижения
  const achievementsList = panel.querySelector('.panel-achievements');
  achievementsList.innerHTML = '';
  scholar.achievements.forEach(achievement => {
    const li = document.createElement('li');
    li.textContent = achievement;
    achievementsList.appendChild(li);
  });

  // Труды
  const worksList = panel.querySelector('.panel-works');
  worksList.innerHTML = '';
  scholar.works.forEach(work => {
    const li = document.createElement('li');
    li.textContent = work;
    worksList.appendChild(li);
  });

  // Связи
  const connectionsDiv = panel.querySelector('.panel-connections');
  connectionsDiv.innerHTML = '';

  if (scholar.connections) {
    const allConnections = [];

    // Собираем все связи
    if (scholar.connections.colleagues) {
      scholar.connections.colleagues.forEach(id => {
        const colleague = scholars.find(s => s.id === id);
        if (colleague) {
          allConnections.push({
            id: id,
            name: getShortName(colleague.name),
            type: 'коллега'
          });
        }
      });
    }

    if (scholar.connections.spouse) {
      const spouse = scholars.find(s => s.id === scholar.connections.spouse);
      if (spouse) {
        allConnections.push({
          id: spouse.id,
          name: getShortName(spouse.name),
          type: 'супруг(а)'
        });
      }
    }

    if (scholar.connections.coauthor) {
      const coauthor = scholars.find(s => s.id === scholar.connections.coauthor);
      if (coauthor) {
        allConnections.push({
          id: coauthor.id,
          name: getShortName(coauthor.name),
          type: 'соавтор'
        });
      }
    }

    if (scholar.connections.closeFriend) {
      const friend = scholars.find(s => s.id === scholar.connections.closeFriend);
      if (friend) {
        allConnections.push({
          id: friend.id,
          name: getShortName(friend.name),
          type: 'близкий друг'
        });
      }
    }

    // Создаём теги связей
    allConnections.forEach(conn => {
      const tag = document.createElement('span');
      tag.className = 'connection-tag';
      tag.textContent = conn.name;
      tag.title = conn.type;
      tag.addEventListener('click', () => {
        const connectedScholar = scholars.find(s => s.id === conn.id);
        if (connectedScholar) {
          showScholarPanel(connectedScholar);
        }
      });
      connectionsDiv.appendChild(tag);
    });
  }

  // Показываем панель
  panel.classList.remove('hidden');
  panel.classList.add('visible');

  // Прокручиваем контент наверх
  content.scrollTop = 0;
}

// Закрыть панель
function closePanel() {
  const panel = document.getElementById('info-panel');
  panel.classList.remove('visible');
  panel.classList.add('hidden');
}

// Получить сокращённое имя (Имя Фамилия)
function getShortName(fullName) {
  const parts = fullName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[parts.length - 1]}`;
  }
  return fullName;
}

// Закрытие панели по клику вне её
document.addEventListener('click', (event) => {
  const panel = document.getElementById('info-panel');
  const isClickInsidePanel = panel.contains(event.target);
  const isClickOnNode = event.target.closest('.node');

  if (!isClickInsidePanel && !isClickOnNode && panel.classList.contains('visible')) {
    closePanel();
  }
});

// Закрытие панели по Escape
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closePanel();
  }
});

// Экспорт функции для использования в graph.js
window.showScholarPanel = showScholarPanel;
