const button = document.getElementById('open-btn');
const popup = document.getElementById('hero-popup');
const closeButton = document.getElementById('close-btn');
const bindButton = document.getElementById('bind-btn');
const phrasesButton = document.getElementById('phrases-btn');
const phrasesPopup = document.getElementById('phrases-popup');
const phrasesCloseBtn = document.getElementById('phrases-close-btn');
const phrasesGrid = document.querySelector('.phrases-grid');
const bottomText = document.getElementById('bottom-text');
let currentHero = null;
let heroId = null;
let phraseNum = null;
let phraseText = null;
let boundKey = null;

const heroesByAttr = {
  strength: ['alchemist','axe','bristleback','centaur','chaos_knight','rattletrap','dawnbreaker','doom_bringer','dragon_knight','earth_spirit','earthshaker','elder_titan','huskar','kunkka','largo','legion_commander','life_stealer','lycan','mars','night_stalker','ogre_magi','omniknight','phoenix','primal_beast','pudge','slardar','spirit_breaker','sven','tidehunter','shredder','tiny','treant','tusk','abyssal_underlord','undying','skeleton_king'],
  agility: ['antimage','bloodseeker','bounty_hunter','broodmother','clinkz','drow_ranger','ember_spirit','faceless_void','gyrocopter','hoodwink','juggernaut','kez','lone_druid','luna','medusa','meepo','mirana','monkey_king','morphling','naga_siren','phantom_assassin','phantom_lancer','razor','riki','nevermore','slark','sniper','spectre','templar_assassin','terrorblade','troll_warlord','ursa','vengefulspirit','viper','weaver'],
  intelligence: ['ancient_apparition','chen','crystal_maiden','dark_seer','dark_willow','disruptor','enchantress','grimstroke','invoker','jakiro','keeper_of_the_light','leshrac','lich','lina','lion','muerta','necrolyte','oracle','obsidian_destroyer','puck','pugna','queenofpain','ringmaster','rubick','shadow_demon','shadow_shaman','silencer','skywrath_mage','storm_spirit','tinker','warlock','winter_wyvern','witch_doctor','zuus'],
  universal: ['abaddon','arc_warden','bane','batrider','beastmaster','brewmaster','dazzle','death_prophet','enigma','wisp','magnataur','marci','furion','nyx_assassin','pangolier','sand_king','snapfire','techies','venomancer','visage','void_spirit','windrunner']
};

const KEY_MAP = {
  ShiftLeft: 'shift', ShiftRight: 'rshift',
  ControlLeft: 'ctrl', ControlRight: 'rctrl',
  AltLeft: 'alt', AltRight: 'ralt',
  MetaLeft: 'lwin', MetaRight: 'rwin',
  ArrowUp: 'uparrow', ArrowDown: 'downarrow',
  ArrowLeft: 'leftarrow', ArrowRight: 'rightarrow',
  Insert: 'ins', Delete: 'del',
  PageUp: 'pgup', PageDown: 'pgdn',
  Comma: ',', Period: '.',
  Slash: '/', 
  Numpad1: 'kp_end', Numpad2: 'kp_downbarrow', Numpad3: 'kp_pgdn', Numpad4: 'kp_leftarrow', Numpad5: 'kp_5',
  Numpad6: 'kp_rightarrow', Numpad7: 'kp_home', Numpad8: 'kp_uparrow', Numpad9: 'kp_pgup', Numpad0: 'kp_ins',
  NumpadDecimal: 'kp_del', NumpadAdd: 'kp_plus',
  NumpadEnter: 'kp_enter', NumpadSubtract: 'kp_minus',
  NumpadDivide: 'kp_slash', NumpadMultiply: 'kp_multiply',
  Quote: '\'', BracketLeft: '[', BracketRight: ']',
  Minus: '-', Equal: '=', Backslash: '\\'
};

function updateBottomText() {
  const heroName = currentHero || null;
  const parts = ['bind'];
  if (heroId && phraseNum) {
    if (boundKey) parts.push(boundKey);
    parts.push('"chatwheel_say ' + heroId + '00' + phraseNum + '"');
    bottomText.textContent = parts.join(' ');
  } else {
    if (phraseText) parts.push('— ' + phraseText);
    if (boundKey) parts.push(boundKey);
    bottomText.textContent = parts.length > 1 ? parts.join(' ') : 'Здесь находится ваш текст.';
  }
}

const openPopup = () => popup.classList.add('active');
const closePopup = () => popup.classList.remove('active');
button.addEventListener('click', openPopup);
closeButton.addEventListener('click', closePopup);

const toast = document.getElementById('toast');
bottomText.addEventListener('click', () => {
  navigator.clipboard.writeText(bottomText.textContent);
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
});

document.addEventListener('DOMContentLoaded', () => {
  Object.entries(heroesByAttr).forEach(([attr, heroes]) => {
    const grid = document.querySelector(`[data-attr="${attr}"] .dota-grid`);
    heroes.forEach(heroName => {
      const item = document.createElement('div');
      item.className = 'hero-item';
      const img = document.createElement('img');
      img.src = `https://cdn.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png`;
      img.alt = heroName;
      item.appendChild(img);
      item.addEventListener('click', () => {
        button.innerHTML = '';
        button.appendChild(img.cloneNode(true));
        currentHero = heroName;
        heroId = null;
        phraseNum = null;
        phraseText = null;
        phrasesButton.textContent = 'Выбор Фразы';
        closePopup();
        updateBottomText();
      });
      grid.appendChild(item);
    });
  });

  updateBottomText();

  phrasesButton.addEventListener('click', () => {
    if (!currentHero) {
      alert('Сначала выберите героя на первую кнопку!');
      return;
    }
    phrasesGrid.innerHTML = '';
    fetch('phrases.json')
      .then(response => {
        if (!response.ok) throw new Error('Не удалось загрузить файл phrases.json');
        return response.json();
      })
      .then(data => {
        const heroPhrases = data[currentHero];
        if (heroPhrases && Array.isArray(heroPhrases)) heroId = heroPhrases[0];
        if (!heroPhrases || !Array.isArray(heroPhrases) || heroPhrases.length === 0) {
          phrasesGrid.innerHTML = '<p style="grid-column: span 3;">У этого героя пока нет прописанных фраз.</p>';
        } else {
          heroPhrases.slice(1, 10).forEach((phrase, i) => {
            const phraseCard = document.createElement('button');
            phraseCard.className = 'phrase-item';
            const group = i < 2 ? 1 : i < 4 ? 2 : i < 6 ? 3 : i === 6 ? 4 : i === 7 ? 5 : 6;
            phraseCard.classList.add('phrase-group-' + group);
            phraseCard.textContent = phrase;
            phraseCard.dataset.number = i + 1;
            phraseCard.addEventListener('click', () => {
              phrasesButton.textContent = phrase;
              phraseNum = phraseCard.dataset.number;
              phraseText = phrase;
              updateBottomText();
              phrasesPopup.classList.remove('active');
            });
            phrasesGrid.appendChild(phraseCard);
          });
        }
        phrasesPopup.classList.add('active');
      })
      .catch(error => {
        console.error('Ошибка:', error);
        alert('Ошибка загрузки фраз.');
      });
  });

  phrasesCloseBtn.addEventListener('click', () => phrasesPopup.classList.remove('active'));
});

if (bindButton) {
  let isWaitingForKey = false;

  bindButton.addEventListener('click', (event) => {
    event.stopPropagation();
    isWaitingForKey = true;
    bindButton.textContent = '[ Нажмите клавишу... ]';
    bindButton.style.borderColor = '#edd134';
  });

  document.addEventListener('keydown', (event) => {
    if (!isWaitingForKey) return;
    event.preventDefault();
    const keyName = event.code;
    const formattedKey = KEY_MAP[keyName] || keyName.replace(/^(Key|Digit)/, '').toLowerCase();
    bindButton.textContent = formattedKey;
    boundKey = formattedKey;
    updateBottomText();
    bindButton.style.borderColor = '';
    isWaitingForKey = false;
  });

  document.addEventListener('click', () => {
    if (isWaitingForKey) {
      bindButton.textContent = 'Назначить клавишу';
      bindButton.style.borderColor = '';
      isWaitingForKey = false;
    }
  });
}
