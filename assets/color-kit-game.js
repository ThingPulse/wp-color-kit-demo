(function() {
  'use strict';
  
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
    const board = gameElement.querySelector('.tp-board');
    const boardBase = gameElement.querySelector('.tp-board-base');
    const tray = gameElement.querySelector('.tp-tray');
    const stepText = gameElement.querySelector('.tp-step-text');
    const completion = gameElement.querySelector('.tp-completion');
    const ghostComponent = gameElement.querySelector('#tp-ghost');
    
    function updateStepIndicator() {
      if (currentStep <= componentOrder.length) {
        const currentComponent = componentOrder[currentStep - 1];
        stepText.textContent = `Step ${currentStep} of ${componentOrder.length}: Place the ${currentComponent.name}`;
      }
    }
    
    function updateGhostComponent() {
      if (currentStep <= componentOrder.length) {
        const currentComponent = componentOrder[currentStep - 1];
        ghostComponent.src = imgPath + currentComponent.id + '.png';
        ghostComponent.style.zIndex = '200';
        ghostComponent.style.display = 'block';
      } else {
        ghostComponent.style.display = 'none';
      }
    }
    
    function showCurrentComponent() {
      const components = tray.querySelectorAll('.tp-component');
      components.forEach(comp => {
        const order = parseInt(comp.dataset.order);
        if (order === currentStep) {
          comp.classList.remove('tp-hidden');
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
      
      if (order === 7) {
        setTimeout(() => {
          flipBoardToBack();
          setTimeout(() => {
            if (currentStep <= componentOrder.length) {
              updateStepIndicator();
              updateGhostComponent();
              showCurrentComponent();
            }
          }, 1600);
        }, 500);
      } else if (currentStep > componentOrder.length) {
        showCompletion();
      } else {
        updateStepIndicator();
        updateGhostComponent();
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
        
        boardBase.src = imgPath + '10_ConnectorBoard.png';
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
      displayOn.src = imgPath + '16_DisplayOn.png';
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
      
      setTimeout(() => {
        completion.classList.remove('tp-hidden');
        stepText.textContent = 'Assembly Complete!';
      }, 2500);
    }
    
    updateStepIndicator();
    updateGhostComponent();
    showCurrentComponent();
    
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
