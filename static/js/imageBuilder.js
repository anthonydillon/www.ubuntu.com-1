(function () {
  const STATE = {
    'board': '',
    'os': '',
    'snaps': []
  };
  const boardSelection = document.querySelectorAll('.js-boards .js-selection');
  const osSelection = document.querySelectorAll('.js-os .js-selection');
  const summaryBoard = document.querySelector('.js-summary-board');
  const summaryOS = document.querySelector('.js-summary-os');
  const summarySnaps = document.querySelector('.js-summary-snaps');
  const snapSearch = document.querySelector('.js-snap-search');
  const snapResults = document.querySelector('.js-snap-results');
  const preinstallResults = document.querySelector('.js-preinstalled-snaps-list');
  const buildButton = document.querySelector('.js-build-button');
  let snapSearchResults;
  selectionListeners(boardSelection, 'board');
  selectionListeners(osSelection, 'os');
  searchHandler();

  function searchHandler() {
    if (snapSearch) {
      snapSearch.addEventListener('submit', e => {
        e.preventDefault();
        const searchInput = snapSearch.querySelector('.p-search-box__input');
        if (searchInput) {
          const searchValue = encodeURI(searchInput.value);
          fetch(`/static/snapcraft-fixture.json?q=${searchValue}`)
            .then((response) => {
              return response.json();
            })
            .then((json) => {
              snapSearchResults = json["_embedded"]["clickindex:package"];
              renderSnapList(snapSearchResults, snapResults, 'Add');
              addSnapHandler();
            });
        }
      });
    }
  }

  function addSnapHandler() {
    const snapAddButtons = snapResults.querySelectorAll('.js-add-snap');

    snapAddButtons.forEach(addButton => {
      addButton.addEventListener('click', e => {
        e.preventDefault();
        if (!lookup(snapSearchResults[e.target.dataset.index].snap_id, 'snap_id', STATE.snaps)) {
          const selectedSnapContainer = e.target.closest('.p-media-object');
          if (selectedSnapContainer) {
            selectedSnapContainer.classList.add('u-hide');
          }
          STATE.snaps.push(snapSearchResults[e.target.dataset.index]);
          renderSnapList(STATE.snaps, preinstallResults, 'Remove');
          removeSnapHandler();
        }
      });
    });
  }

  function removeSnapHandler() {
    const snapRemoveButtons = preinstallResults.querySelectorAll('.js-remove-snap');
    snapRemoveButtons.forEach(removeButton => {
      removeButton.addEventListener('click', e => {
        e.preventDefault();
        searchIndex = lookup(STATE.snaps[e.target.dataset.index].snap_id, 'snap_id', snapSearchResults)
        const revealItem = snapResults.querySelector(`[data-container-index="${searchIndex}"]`)
        if (revealItem) {
          revealItem.classList.remove('u-hide');
        }
        STATE.snaps.splice(e.target.dataset.index, 1);
        renderSnapList(STATE.snaps, preinstallResults, 'Remove');
        removeSnapHandler();
      });
    });
  }
  function renderSnapList(responce, results, buttonText) {
    if (results) {
      results.innerHTML = '';
      responce.forEach((item, index) => {
        results.insertAdjacentHTML('beforeend',
          `<div class="p-media-object" data-container-index="${index}">
            <img src="${item.icon_url}" alt="${item.title}" class="p-media-object__image">
            <div class="p-media-object__details">
              <h1 class="p-media-object__title">${item.title}</h1>
              <p class="p-media-object__content">${item.developer_name}</p>
              <a href="" class="p-button--neutral js-${buttonText.toLowerCase()}-snap" data-index="${index}">${buttonText}</a>
            </div>
          </div>`
        );
      });
      render();
    }
  }

  function selectionListeners(collection, stateIndex) {
    collection.forEach(selection => {
      selection.addEventListener('click', function() {
        selectCollection(collection, selection);
        const value = this.querySelector('.p-card__content').innerText;
        changeState(stateIndex, value);
        updateOSs();
      });
    });
  }

  function selectCollection(collection, selected) {
    collection.forEach(item => {
      item.classList.remove('is-selected');
    });
    selected.classList.add('is-selected');
  }

  function updateOSs() {
    osSelection.forEach(selection => {
      const osSupport = selection.dataset.supports;
      const selectedBoard = STATE.board.replace(' ', '-').toLowerCase();

      // Check if the currently selected OS supports the this board
      if (osSupport.includes(selectedBoard)) {
        selection.classList.remove('u-hide');
      } else {
        selection.classList.add('u-hide');

        // If current OS selection is not supported by the board reset OS
        if (selection.classList.contains('is-selected')) {
          changeState('os', '');
          selection.classList.remove('is-selected');
        }
      }
    });
  }

  function renderSummary() {
    if (summaryBoard) {
      summaryBoard.innerText = STATE.board;
    }
    if (summaryOS) {
      summaryOS.innerText = STATE.os;
    }
    if (summarySnaps) {
      summarySnaps.innerText = STATE.snaps.length;
    }

    if (STATE.board != '' && STATE.os != '') {
      buildButton.setAttribute('aria-disabled', 'false');
      buildButton.disabled = false;
    } else {
      buildButton.setAttribute('aria-disabled', 'true');
      buildButton.disabled = true;
    }
  }

  function render() {
    renderSummary();
  }

  function changeState(key, value) {
    STATE[key] = value;
    render();
  }

  // Utils
  function lookup(name, key, arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i][key] === name) {
        return i;
      }
    }
    return false;
  }
})()