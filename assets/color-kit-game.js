(function() {
  'use strict';
  
  console.log('Color Kit Game Script Loaded v1.0.7');
  
  const componentOrder = [
    { id: '01_FemaleHeaderPins_12P', name: 'Female Header Pins (12P)', order: 1 },
    { id: '02_FemaleHeaderPins_16p', name: 'Female Header Pins (16P)', order: 2 },
    { id: '03_MaleHeaderPins_12P', name: 'Male Header Pins (12P)', order: 3 },
    { id: '04_MaleHeaderPins_16P', name: 'Male Header Pins (16P)', order: 4 },
    { id: '05_ePulseFeather', name: 'ePulse Feather', order: 5 },
    { id: '06_PowerSwitch', name: 'Power Switch', order: 6 },
    { id: '07_GroveConnector', name: 'Grove Connector', order: 7 },
    { id: '11_Sticker1', name: 'Sticker 1', order: 8 },
    { id: '12_Sticker2', name: 'Sticker 2', order: 9 },
    { id: '13_Sticker3', name: 'Sticker 3', order: 10 },
    { id: '14_Sticker4', name: 'Sticker 4', order: 11 },
    { id: '15_Display', name: 'Display', order: 12 }
  ];
  
  function initGame(gameElement) {
    let currentStep = 1;
    let draggedElement = null;
    let offsetX = 0;
    let offsetY = 0;
    let originalParent = null;
    
    const imgPath = gameElement.dataset.imgPath || 'img/';
    let translations = null;
    if (gameElement.dataset.translations) {
      try {
        translations = JSON.parse(gameElement.dataset.translations);
        console.log('Translations loaded:', translations);
      } catch (e) {
        console.error('Failed to parse translations:', e);
        console.log('Translation data:', gameElement.dataset.translations);
      }
    }
    const board = gameElement.querySelector('.tp-board');
    
    // Universal tracking function for multiple analytics platforms
    function trackEvent(eventName, eventData = {}) {
      // Microsoft Clarity
      if (typeof window.clarity === 'function') {
        window.clarity('event', eventName);
      }
      
      // Google Analytics 4 (gtag.js)
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, eventData);
      }
      
      // Google Analytics Universal (analytics.js)
      if (typeof window.ga === 'function') {
        const label = eventData.step ? `Step ${eventData.step}` : '';
        window.ga('send', 'event', 'Color Kit Game', eventName, label);
      }
      
      // Google Tag Manager
      if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({
          'event': eventName,
          'eventCategory': 'Color Kit Game',
          ...eventData
        });
      }
      
      // Facebook Pixel
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', eventName, eventData);
      }
      
      // Plausible Analytics
      if (typeof window.plausible === 'function') {
        window.plausible(eventName, { props: eventData });
      }
    }
    const boardBase = gameElement.querySelector('.tp-board-base');
    const tray = gameElement.querySelector('.tp-tray');
    const stepText = gameElement.querySelector('.tp-step-text');
    const completion = gameElement.querySelector('.tp-completion');
    const ghostComponent = gameElement.querySelector('#tp-ghost');
    const preview3d = gameElement.querySelector('#tp-3d-image');
    
    function updateStepIndicator() {
      if (currentStep <= componentOrder.length) {
        const currentComponent = componentOrder[currentStep - 1];
        if (translations && translations.step_text && translations.components[currentComponent.id]) {
          stepText.textContent = translations.step_text
            .replace('%d', currentStep)
            .replace('%d', componentOrder.length)
            .replace('%s', translations.components[currentComponent.id]);
        } else {
          stepText.textContent = `Step ${currentStep} of ${componentOrder.length}: Place the ${currentComponent.name}`;
        }
      }
    }
    
    function updateGhostComponent() {
      if (currentStep <= componentOrder.length) {
        const currentComponent = componentOrder[currentStep - 1];
        ghostComponent.src = imgPath + currentComponent.id + '.webp';
        ghostComponent.style.zIndex = '200';
        ghostComponent.style.display = 'block';
      } else {
        ghostComponent.style.display = 'none';
      }
    }
    
    function update3DPreview() {
      // Show the state BEFORE placing the current component
      // For step 1: show empty board (handled by initial HTML)
      // For step 2: show state after step 1 was placed
      if (currentStep === 1) {
        // Show empty board
        preview3d.src = imgPath + '3d/00_ConnectorBoard.webp';
      } else if (currentStep <= componentOrder.length) {
        // Show what it looked like after the previous component was placed
        const previousComponent = componentOrder[currentStep - 2];
        let filename3d = previousComponent.id;
        
        // Handle naming differences between component and 3D files
        if (previousComponent.id === '01_FemaleHeaderPins_12P') filename3d = '01_FemaleHeader_12P';
        if (previousComponent.id === '02_FemaleHeaderPins_16p') filename3d = '02_FemaleHeader_16p';
        if (previousComponent.id === '03_MaleHeaderPins_12P') filename3d = '03_MaleHeader_12p';
        if (previousComponent.id === '04_MaleHeaderPins_16P') filename3d = '04_MaleHeader_16p';
        
        preview3d.src = imgPath + '3d/' + filename3d + '.webp';
      } else {
        // After all components placed, show the final display (step 12 = 15_Display)
        preview3d.src = imgPath + '3d/15_Display.webp';
      }
    }
    
    function removeDragHint() {
      const firstComponent = tray.querySelector('[data-order="1"]');
      if (firstComponent && firstComponent.dataset.fakeCursor === 'active') {
        firstComponent.classList.remove('tp-drag-hint');
        const fakeCursor = tray.querySelector('.tp-fake-cursor');
        if (fakeCursor) {
          fakeCursor.remove();
        }
        firstComponent.dataset.fakeCursor = 'removed';
      }
    }
    
    function showCurrentComponent() {
      const components = tray.querySelectorAll('.tp-component');
      components.forEach(comp => {
        const order = parseInt(comp.dataset.order);
        if (order === currentStep) {
          comp.classList.remove('tp-hidden');
          
          // Show drag hint on first component only
          if (currentStep === 1 && !comp.dataset.hintShown) {
            comp.dataset.hintShown = 'true';
            comp.classList.add('tp-drag-hint');
            
            // Create fake cursor element
            const fakeCursor = document.createElement('div');
            fakeCursor.className = 'tp-fake-cursor';
            fakeCursor.innerHTML = '👆';
            comp.parentElement.appendChild(fakeCursor);
            
            // Position cursor relative to component
            const rect = comp.getBoundingClientRect();
            const trayRect = comp.parentElement.getBoundingClientRect();
            fakeCursor.style.left = (rect.left - trayRect.left + rect.width / 2) + 'px';
            fakeCursor.style.top = (rect.top - trayRect.top + rect.height / 2) + 'px';
            
            // Store reference to fake cursor for later removal
            comp.dataset.fakeCursor = 'active';
            
            // Add event listener to remove hint when mouse/pointer enters tray
            tray.addEventListener('pointerenter', removeDragHint, { once: true });
          }
        } else if (!comp.classList.contains('tp-placed')) {
          comp.classList.add('tp-hidden');
        }
      });
    }
    
    function handlePointerDown(e) {
      const component = e.target;
      if (!component.classList.contains('tp-component') || component.classList.contains('tp-placed')) {
        return;
      }
      
      const order = parseInt(component.dataset.order);
      if (order !== currentStep) {
        return;
      }
      
      e.preventDefault();
      
      // Remove drag hint animation when user starts dragging
      removeDragHint();
      
      draggedElement = component;
      originalParent = component.parentElement;
      
      const rect = component.getBoundingClientRect();
      const pointerX = e.clientX || e.touches?.[0]?.clientX || 0;
      const pointerY = e.clientY || e.touches?.[0]?.clientY || 0;
      
      offsetX = pointerX - rect.left;
      offsetY = pointerY - rect.top;
      
      component.classList.add('tp-dragging');
      component.style.left = rect.left + 'px';
      component.style.top = rect.top + 'px';
      component.style.width = rect.width + 'px';
      component.style.height = rect.height + 'px';
      
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    }
    
    function handlePointerMove(e) {
      if (!draggedElement) return;
      
      e.preventDefault();
      
      const pointerX = e.clientX || e.touches?.[0]?.clientX || 0;
      const pointerY = e.clientY || e.touches?.[0]?.clientY || 0;
      
      draggedElement.style.left = (pointerX - offsetX) + 'px';
      draggedElement.style.top = (pointerY - offsetY) + 'px';
    }
    
    function handlePointerUp(e) {
      if (!draggedElement) return;
      
      e.preventDefault();
      
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      
      const pointerX = e.clientX || e.changedTouches?.[0]?.clientX || 0;
      const pointerY = e.clientY || e.changedTouches?.[0]?.clientY || 0;
      
      const boardRect = board.getBoundingClientRect();
      
      const isOverBoard = (
        pointerX >= boardRect.left &&
        pointerX <= boardRect.right &&
        pointerY >= boardRect.top &&
        pointerY <= boardRect.bottom
      );
      
      if (isOverBoard) {
        placeComponent(draggedElement);
      } else {
        snapBack(draggedElement);
      }
      
      draggedElement = null;
    }
    
    function placeComponent(component) {
      const fullSrc = component.dataset.fullSrc;
      if (fullSrc) {
        component.src = fullSrc;
      }
      
      component.classList.remove('tp-dragging');
      component.classList.add('tp-placed');
      component.style.position = 'absolute';
      component.style.top = '0';
      component.style.left = '0';
      component.style.width = '100%';
      component.style.height = '100%';
      
      const order = parseInt(component.dataset.order);
      component.style.zIndex = order + 1;
      
      board.appendChild(component);
      
      currentStep++;
      
      // Show 3D preview after first component is placed
      if (currentStep === 2 && preview3d) {
        preview3d.parentElement.classList.remove('tp-hidden');
      }
      
      // Track component placement
      trackEvent('color_kit_component_placed', {
        step: currentStep - 1,
        component: component.dataset.id
      });
      
      if (order === 7) {
        setTimeout(() => {
          flipBoardToBack();
          setTimeout(() => {
            if (currentStep <= componentOrder.length) {
              updateStepIndicator();
              updateGhostComponent();
              update3DPreview();
              showCurrentComponent();
            }
          }, 1600);
        }, 500);
      } else if (currentStep > componentOrder.length) {
        showCompletion();
      } else {
        updateStepIndicator();
        updateGhostComponent();
        update3DPreview();
        showCurrentComponent();
      }
    }
    
    function snapBack(component) {
      component.classList.remove('tp-dragging');
      component.style.position = '';
      component.style.left = '';
      component.style.top = '';
      component.style.width = '';
      component.style.height = '';
      
      if (originalParent && originalParent.contains(component) === false) {
        originalParent.appendChild(component);
      }
    }
    
    function flipBoardToBack() {
      ghostComponent.style.display = 'none';
      
      board.style.transition = 'transform 0.8s ease-in-out';
      board.style.transformStyle = 'preserve-3d';
      board.style.transform = 'rotateY(180deg)';
      
      setTimeout(() => {
        const placedComponents = board.querySelectorAll('.tp-component.tp-placed');
        placedComponents.forEach(comp => {
          const order = parseInt(comp.dataset.order);
          if (order <= 7) {
            comp.style.display = 'none';
          }
        });
        
        boardBase.src = imgPath + '10_ConnectorBoard.webp';
        board.style.transform = 'rotateY(360deg)';
        
        setTimeout(() => {
          board.style.transition = '';
          board.style.transform = '';
          updateGhostComponent();
        }, 800);
      }, 800);
    }
    
    function showDisplayOn() {
      ghostComponent.style.display = 'none';
      
      const displayOn = document.createElement('img');
      displayOn.src = imgPath + '16_DisplayOn.webp';
      displayOn.style.position = 'absolute';
      displayOn.style.top = '0';
      displayOn.style.left = '0';
      displayOn.style.width = '100%';
      displayOn.style.height = '100%';
      displayOn.style.objectFit = 'contain';
      displayOn.style.zIndex = '300';
      displayOn.style.opacity = '0';
      displayOn.style.animation = 'tp-flicker 2s ease-in-out';
      
      board.appendChild(displayOn);
      
      setTimeout(() => {
        displayOn.style.animation = '';
        displayOn.style.opacity = '1';
      }, 2000);
    }
    
    function showCompletion() {
      showDisplayOn();
      tray.style.display = 'none';
      
      // Update 3D preview to show final state with display on
      if (preview3d) {
        preview3d.src = imgPath + '3d/16_DisplayOn.webp';
      }
      
      // Track game completion
      trackEvent('color_kit_game_completed', {
        language: gameElement.dataset.lang || 'en'
      });
      
      setTimeout(() => {
        // Hide step indicator and show completion box in its place
        stepText.parentElement.classList.add('tp-hidden');
        completion.classList.remove('tp-hidden');
        
        // Update completion text and button with translations
        const completionText = completion.querySelector('.tp-completion-text');
        const completionBtn = completion.querySelector('.tp-completion-btn');
        
        if (completionText && translations && translations.completion_text) {
          completionText.innerHTML = translations.completion_text;
        }
        
        if (completionBtn && translations && translations.button_text) {
          completionBtn.textContent = translations.button_text;
        }
      }, 2500);
    }
    
    updateStepIndicator();
    updateGhostComponent();
    update3DPreview();
    
    // Use Intersection Observer to show hint only when game becomes visible
    let hintShown = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hintShown && currentStep === 1) {
          hintShown = true;
          showCurrentComponent();
          
          // Track game start when it becomes visible
          trackEvent('color_kit_game_started', {
            language: gameElement.dataset.lang || 'en'
          });
          
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.3 // Trigger when 30% of the game is visible
    });
    
    observer.observe(gameElement);
    
    // If game is already visible on load, show immediately
    const rect = gameElement.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isVisible) {
      showCurrentComponent();
      trackEvent('color_kit_game_started', {
        language: gameElement.dataset.lang || 'en'
      });
      observer.disconnect();
    }
    
    const components = gameElement.querySelectorAll('.tp-component');
    components.forEach(comp => {
      comp.addEventListener('pointerdown', handlePointerDown);
    });
  }
  
  function init() {
    const games = document.querySelectorAll('#tp-board-game');
    games.forEach(game => initGame(game));
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
